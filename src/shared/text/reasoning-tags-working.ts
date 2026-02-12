export type ReasoningTagMode = "strict" | "preserve";
export type ReasoningTagTrim = "none" | "start" | "both";

// Regex patterns for different tag formats
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)\u0111/g;
const SPECIAL_OPEN_RE = /\u0110(thinking|thought|antthinking)/g;

// HTML entity patterns
const HTML_ENTITY_CLOSE_RE = /(thinking|thought|antthinking)&#x111;/gi;
const HTML_ENTITY_OPEN_RE = /&#x110;(thinking|thought|antthinking)/gi;

interface CodeRegion {
  start: number;
  end: number;
}

function findCodeRegions(text: string): CodeRegion[] {
  const regions: CodeRegion[] = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  // Find inline code
  const inlineRe = /`+[^`]+`+/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = regions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      regions.push({ start, end });
    }
  }

  regions.sort((a, b) => a.start - b.start);
  return regions;
}

function isInsideCode(pos: number, regions: CodeRegion[]): boolean {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

function applyTrim(value: string, mode: ReasoningTagTrim): string {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  return value.trim();
}

export function stripReasoningTagsFromText(
  text: string,
  options?: {
    mode?: ReasoningTagMode;
    trim?: ReasoningTagTrim;
  },
): string {
  if (!text) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  let cleaned = text;

  // Check if we have any reasoning tags to process (before conversion)
  const hasHtmlTags = HTML_THINKING_TAG_RE.test(cleaned);
  const hasFinalTags = FINAL_TAG_RE.test(cleaned);
  const hasSpecialTags = SPECIAL_CLOSE_RE.test(cleaned) || SPECIAL_OPEN_RE.test(cleaned);
  const hasHtmlEntityTags = HTML_ENTITY_CLOSE_RE.test(cleaned) || HTML_ENTITY_OPEN_RE.test(cleaned);

  // Reset regex states
  HTML_THINKING_TAG_RE.lastIndex = 0;
  FINAL_TAG_RE.lastIndex = 0;
  SPECIAL_CLOSE_RE.lastIndex = 0;
  SPECIAL_OPEN_RE.lastIndex = 0;
  HTML_ENTITY_CLOSE_RE.lastIndex = 0;
  HTML_ENTITY_OPEN_RE.lastIndex = 0;

  if (!hasHtmlTags && !hasFinalTags && !hasSpecialTags && !hasHtmlEntityTags) {
    return text;
  }

  const codeRegions = findCodeRegions(cleaned);
  const rangesToRemove: Array<{ start: number; end: number }> = [];

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

  // Update special tags detection after conversion
  SPECIAL_CLOSE_RE.lastIndex = 0;
  SPECIAL_OPEN_RE.lastIndex = 0;
  const hasSpecialTagsAfterConversion =
    SPECIAL_CLOSE_RE.test(cleaned) || SPECIAL_OPEN_RE.test(cleaned);
  SPECIAL_CLOSE_RE.lastIndex = 0;
  SPECIAL_OPEN_RE.lastIndex = 0;

  // Process final tags first
  if (hasFinalTags) {
    const stack: Array<{ start: number }> = [];
    FINAL_TAG_RE.lastIndex = 0;

    for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
      const idx = match.index ?? 0;
      const isClose = match[0].includes("</final");

      if (isInsideCode(idx, codeRegions)) {
        continue;
      }

      if (!isClose) {
        stack.push({ start: idx });
      } else if (stack.length > 0) {
        const open = stack.pop()!;
        rangesToRemove.push({
          start: open.start,
          end: idx + match[0].length,
        });
      }
    }
  }

  // Process HTML thinking tags
  if (hasHtmlTags) {
    const stack: Array<{ start: number }> = [];
    HTML_THINKING_TAG_RE.lastIndex = 0;

    for (const match of cleaned.matchAll(HTML_THINKING_TAG_RE)) {
      const idx = match.index ?? 0;
      const isClose = match[1] === "/";

      if (isInsideCode(idx, codeRegions)) {
        continue;
      }

      if (!isClose) {
        stack.push({ start: idx });
      } else if (stack.length > 0) {
        const open = stack.pop()!;
        rangesToRemove.push({
          start: open.start,
          end: idx + match[0].length,
        });
      }
    }

    // Handle unclosed HTML tags
    if (stack.length > 0) {
      if (mode === "preserve") {
        // Return content of unclosed tags
        let result = "";
        for (const open of stack) {
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const contentStart = open.start + tagMatch[0].length;
            result += cleaned.slice(contentStart);
          }
        }
        return applyTrim(result, trimMode);
      } else {
        // Remove unclosed tags and their content
        for (const open of stack) {
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const tagEnd = open.start + tagMatch[0].length;
            const remainingContent = cleaned.slice(tagEnd);
            const newlineIndex = remainingContent.indexOf("\n");

            if (newlineIndex !== -1) {
              rangesToRemove.push({
                start: open.start,
                end: tagEnd + newlineIndex,
              });
            } else {
              rangesToRemove.push({
                start: open.start,
                end: cleaned.length,
              });
            }
          }
        }
      }
    }
  }

  // Process special character tags (both original and converted from HTML entities)
  if (hasSpecialTagsAfterConversion) {
    // First, handle closing tags (like thinkingđ)
    const closeMatches = [...cleaned.matchAll(SPECIAL_CLOSE_RE)];
    for (const match of closeMatches) {
      const idx = match.index ?? 0;
      if (!isInsideCode(idx, codeRegions)) {
        rangesToRemove.push({
          start: idx,
          end: idx + match[0].length,
        });
      }
    }

    // Then handle opening tags (like Đthinking) - these are unclosed
    const openMatches = [...cleaned.matchAll(SPECIAL_OPEN_RE)];
    if (openMatches.length > 0) {
      if (mode === "preserve") {
        // Return content of unclosed tags
        let result = "";
        for (const match of openMatches) {
          const idx = match.index ?? 0;
          if (!isInsideCode(idx, codeRegions)) {
            const contentStart = idx + match[0].length;
            result += cleaned.slice(contentStart);
          }
        }
        return applyTrim(result, trimMode);
      } else {
        // Remove unclosed tags and their content
        for (const match of openMatches) {
          const idx = match.index ?? 0;
          if (!isInsideCode(idx, codeRegions)) {
            const remainingContent = cleaned.slice(idx + match[0].length);
            const newlineIndex = remainingContent.indexOf("\n");

            if (newlineIndex !== -1) {
              rangesToRemove.push({
                start: idx,
                end: idx + match[0].length + newlineIndex,
              });
            } else {
              rangesToRemove.push({
                start: idx,
                end: cleaned.length,
              });
            }
          }
        }
      }
    }
  }

  // Remove all ranges in reverse order
  rangesToRemove.sort((a, b) => a.start - b.start);
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  return applyTrim(cleaned, trimMode);
}
