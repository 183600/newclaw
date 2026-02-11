export type ReasoningTagMode = "strict" | "preserve";
export type ReasoningTagTrim = "none" | "start" | "both";

const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const SPECIAL_CLOSE_RE = /(?:thinking|thought|antthinking)\u0111/g;
const SPECIAL_OPEN_RE = /\u0110(?:thinking|thought|antthinking)/g;

interface CodeRegion {
  start: number;
  end: number;
}

function findCodeRegions(text: string): CodeRegion[] {
  const regions: CodeRegion[] = [];

  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = (match.index ?? 0) + match[1].length;
    regions.push({ start, end: start + match[0].length - match[1].length });
  }

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
  if (!QUICK_TAG_RE.test(text)) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  // First handle final tags
  if (FINAL_TAG_RE.test(cleaned)) {
    FINAL_TAG_RE.lastIndex = 0;
    const preCodeRegions = findCodeRegions(cleaned);
    const finalRanges: Array<{ start: number; end: number }> = [];
    let stack: Array<{ start: number }> = [];

    for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
      const idx = match.index ?? 0;
      const isClose = match[0].includes("</final");

      if (isInsideCode(idx, preCodeRegions)) {
        continue;
      }

      if (!isClose) {
        stack.push({ start: idx });
      } else if (stack.length > 0) {
        const open = stack.pop()!;
        finalRanges.push({
          start: open.start,
          end: idx + match[0].length,
        });
      }
    }

    // Remove final ranges in reverse order to maintain indices
    for (let i = finalRanges.length - 1; i >= 0; i--) {
      const range = finalRanges[i];
      cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    }
  } else {
    FINAL_TAG_RE.lastIndex = 0;
  }

  // Now handle thinking tags
  const codeRegions = findCodeRegions(cleaned);
  const thinkingRanges: Array<{ start: number; end: number }> = [];
  let stack: Array<{ start: number; type: "html" | "special" }> = [];

  // Find all HTML thinking tags
  THINKING_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop()!;
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
    }
  }

  // Find all special character thinking tags
  let i = 0;
  while (i < cleaned.length) {
    // Check for special character opening tags (Đthinking or Đthought)
    if (cleaned[i] === "\u0110" && i + 7 < cleaned.length) {
      const tagWord = cleaned.substring(i + 1, i + 8);
      if (tagWord === "thinking" || tagWord === "thought") {
        if (!isInsideCode(i, codeRegions)) {
          stack.push({ start: i, type: "special" });
        }
        i += 8;
        continue;
      }
    }

    // Check for special character closing tags (thinkingđ or thoughtđ)
    if (
      i + 7 < cleaned.length &&
      (cleaned.substring(i, i + 8) === "thinking\u0111" ||
        cleaned.substring(i, i + 7) === "thought\u0111")
    ) {
      if (!isInsideCode(i, codeRegions)) {
        // Find the matching opening tag
        let found = false;
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].type === "special") {
            const open = stack.splice(j, 1)[0];
            thinkingRanges.push({
              start: open.start,
              end: i + (cleaned.substring(i, i + 8) === "thinking\u0111" ? 8 : 7),
            });
            found = true;
            break;
          }
        }
        // Handle unmatched closing special tags
        if (!found) {
          thinkingRanges.push({
            start: i,
            end: i + (cleaned.substring(i, i + 8) === "thinking\u0111" ? 8 : 7),
          });
        }
      }
      i += cleaned.substring(i, i + 8) === "thinking\u0111" ? 8 : 7;
      continue;
    }

    i++;
  }

  // Handle unclosed thinking tags
  if (stack.length > 0) {
    if (mode === "preserve") {
      // In preserve mode, only return the content of unclosed tags
      let result = "";
      for (const open of stack) {
        if (open.type === "special") {
          // For special char tags, content starts after the tag word
          const tagWord = cleaned.substring(open.start + 1, open.start + 8);
          if (tagWord === "thinking" || tagWord === "thought") {
            const contentStart = open.start + 8;
            result += cleaned.slice(contentStart);
          }
        } else {
          // For HTML tags, find the end of the opening tag
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const contentStart = open.start + tagMatch[0].length;
            result += cleaned.slice(contentStart);
          }
        }
      }
      return applyTrim(result, trimMode);
    } else if (mode === "strict") {
      // In strict mode, remove unclosed tags and their content
      for (const open of stack) {
        if (open.type === "special") {
          // For special char tags, remove from start to end of line or document
          const remainingContent = cleaned.slice(open.start);
          const newlineIndex = remainingContent.indexOf("\n");

          if (newlineIndex !== -1) {
            thinkingRanges.push({
              start: open.start,
              end: open.start + newlineIndex,
            });
          } else {
            thinkingRanges.push({
              start: open.start,
              end: cleaned.length,
            });
          }
        } else {
          // For HTML tags, find the end of the opening tag
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const tagEnd = open.start + tagMatch[0].length;
            // Look for a newline after the tag content
            const remainingContent = cleaned.slice(tagEnd);
            const newlineIndex = remainingContent.indexOf("\n");

            if (newlineIndex !== -1) {
              // If there's a newline, remove only up to the newline
              thinkingRanges.push({
                start: open.start,
                end: tagEnd + newlineIndex,
              });
            } else {
              // If no newline, remove everything from the tag start
              thinkingRanges.push({
                start: open.start,
                end: cleaned.length,
              });
            }
          } else {
            // If we can't find the tag end, remove everything from start
            thinkingRanges.push({
              start: open.start,
              end: cleaned.length,
            });
          }
        }
      }
    }
  }

  // Also handle special case: word followed by closing tag (e.g., "thinking</thinking>" or "thinking</t>")
  // Match specific patterns like "This is thinking</t>" or "First thought</t>"
  // Use a single regex that handles both cases
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      // Remove the entire match
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Also handle plain closing tags like "word</thinking>" or "word</t>"
  // Use negative lookbehind to avoid matching at the beginning of the string
  const plainClosingTagRe = /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;
  for (const match of cleaned.matchAll(plainClosingTagRe)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      // Remove the entire match
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  return applyTrim(cleaned, trimMode);
}
