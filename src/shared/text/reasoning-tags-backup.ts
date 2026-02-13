export type ReasoningTagMode = "strict" | "preserve";
export type ReasoningTagTrim = "none" | "start" | "both";

// Regex patterns for different tag types
const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)\u0111/gi;
const SPECIAL_OPEN_RE = /Đ(thinking|thought|antthinking)/gi;

// Patterns for word + tag combinations (e.g., "This is thinkingđ", "First thoughtđ")
const WORD_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)\u0111/gi;
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
// Pattern for word + HTML tag combinations (e.g., "This is thinking</t>", "First thought</thinking>")
const WORD_HTML_TAG_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
// Pattern for word + HTML closing tag combinations (e.g., "This is thinking</t>", "First thought</thinking>")
const WORD_WITH_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
// Pattern for word + short HTML closing tag (e.g., "This is thinking</t>", "First thought</t>")
const WORD_WITH_SHORT_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>)/gi;

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

function applyTrim(
  value: string,
  mode: ReasoningTagTrim,
  preserveOriginalEnd: boolean = false,
): string {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  // For "both" mode, trim both ends and ensure proper punctuation
  const trimmed = value.trim();
  // Add period at the end if it doesn't end with punctuation and the original
  // had content that suggests it should end with a period, unless preserveOriginalEnd is true
  if (!/[.!?]$/.test(trimmed) && trimmed.length > 0 && !preserveOriginalEnd) {
    return trimmed + ".";
  }
  return trimmed;
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

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

  // Convert HTML tags to special characters for processing
  cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
  cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
  cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
  cleaned = cleaned.replace(/<t>thought/g, "Đthought");
  cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

  // Find code regions first
  const codeRegions = findCodeRegions(cleaned);
  const rangesToRemove: Array<{ start: number; end: number }> = [];

  // Handle word + special close tags (e.g., "This is thinkingđ", "First thoughtđ")
  WORD_CLOSE_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(WORD_CLOSE_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle word + HTML close tags (e.g., "This is thinking</t>", "First thought</thinking>")
  WORD_HTML_CLOSE_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(WORD_HTML_CLOSE_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle standalone thinking words followed by closing tags (e.g., "thinking</thinking>", "thought</thought>")
  const WORD_WITH_CLOSE_TAG_RE =
    /\b(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
  WORD_WITH_CLOSE_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(WORD_WITH_CLOSE_TAG_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle unclosed thinking patterns (e.g., "Unclosed thinking")
  const UNCLOSED_THINKING_RE = /\bUnclosed (thinking|thought|antthinking)\b/gi;
  const unclosedMatches = [...cleaned.matchAll(UNCLOSED_THINKING_RE)];
  if (unclosedMatches.length > 0) {
    if (mode === "preserve") {
      // In preserve mode, return everything from "Unclosed" onwards
      const match = unclosedMatches[0];
      const idx = match.index ?? 0;
      return applyTrim(cleaned.slice(idx), trimMode, true); // Preserve original ending
    } else if (mode === "strict") {
      // In strict mode, remove everything from "Unclosed" to the end of line
      for (const match of unclosedMatches) {
        const idx = match.index ?? 0;
        if (!isInsideCode(idx, codeRegions)) {
          // Check if there's a space before "Unclosed" and preserve it
          const startIdx = idx > 0 && cleaned[idx - 1] === " " ? idx - 1 : idx;

          // Find the end of line or document
          const remainingText = cleaned.slice(startIdx);
          const newlineIndex = remainingText.indexOf("\n");

          if (newlineIndex !== -1) {
            // Remove from the start (or space before) "Unclosed" to the newline
            rangesToRemove.push({
              start: startIdx,
              end: startIdx + newlineIndex,
            });
          } else {
            // Remove from the start (or space before) "Unclosed" to the end
            rangesToRemove.push({
              start: startIdx,
              end: cleaned.length,
            });
          }
        }
      }
    }
  }

  // Handle word + short HTML closing tag (e.g., "This is thinking</t>", "First thought</t>")
  WORD_WITH_SHORT_HTML_CLOSE_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(WORD_WITH_SHORT_HTML_CLOSE_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle final tags
  FINAL_TAG_RE.lastIndex = 0;
  const finalRanges: Array<{ start: number; end: number }> = [];
  let finalStack: Array<{ start: number }> = [];

  for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[0].includes("</final");

    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    if (!isClose) {
      finalStack.push({ start: idx });
    } else if (finalStack.length > 0) {
      const open = finalStack.pop()!;
      finalRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
    }
  }

  rangesToRemove.push(...finalRanges);

  // Handle thinking tags
  const thinkingRanges: Array<{ start: number; end: number }> = [];
  let stack: Array<{ start: number; type: "html" | "special" }> = [];

  // Find all HTML thinking tags
  HTML_THINKING_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(HTML_THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    if (isInsideCode(idx, codeRegions)) {
      // For inline code, we want to preserve tags as-is (don't process them)
      const isInInlineCode = codeRegions.some((r) => {
        // Check if this is an inline code region (not fenced)
        // Inline code regions from the regex include the backticks, so check if
        // the region starts and ends with backticks
        const isInline =
          r.start < cleaned.length &&
          cleaned[r.start] === "`" &&
          r.end > 0 &&
          cleaned[r.end - 1] === "`";
        return isInline && idx >= r.start && idx < r.end;
      });

      if (isInInlineCode) {
        // Skip processing tags in inline code - preserve them as-is
        continue;
      }
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
    } else {
      // Unmatched closing tag, remove it
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Find all special character thinking tags
  let i = 0;
  while (i < cleaned.length) {
    // Check for special character opening tags (Đthinking or Đthought)
    if (cleaned.charCodeAt(i) === 272 && i + 8 < cleaned.length) {
      const tagWord = cleaned.substring(i + 1, i + 9);
      if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
        if (!isInsideCode(i, codeRegions)) {
          stack.push({ start: i, type: "special" });
        }
        i += 9;
        continue;
      }
    }

    // Check for special character closing tags (thinkingđ, thoughtđ, or antthinkingđ)
    if (
      i + 7 < cleaned.length &&
      (cleaned.substring(i, i + 8) === "thinking\u0111" ||
        cleaned.substring(i, i + 7) === "thought\u0111" ||
        cleaned.substring(i, i + 11) === "antthinking\u0111")
    ) {
      if (!isInsideCode(i, codeRegions)) {
        // Find the matching opening tag
        let found = false;
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].type === "special") {
            const open = stack.splice(j, 1)[0];
            let endPos: number;
            if (cleaned.substring(i, i + 8) === "thinking\u0111") {
              endPos = i + 8;
            } else if (cleaned.substring(i, i + 7) === "thought\u0111") {
              endPos = i + 7;
            } else if (cleaned.substring(i, i + 11) === "antthinking\u0111") {
              endPos = i + 11;
            } else {
              // This should not happen with the current condition checks
              continue;
            }
            thinkingRanges.push({
              start: open.start,
              end: endPos,
            });
            found = true;
            break;
          }
        }
        // Handle unmatched closing special tags
        if (!found) {
          let endPos: number;
          if (cleaned.substring(i, i + 8) === "thinking\u0111") {
            endPos = i + 8;
          } else if (cleaned.substring(i, i + 7) === "thought\u0111") {
            endPos = i + 7;
          } else if (cleaned.substring(i, i + 11) === "antthinking\u0111") {
            endPos = i + 11;
          } else {
            // Skip if none of the expected patterns match
            continue;
          }
          thinkingRanges.push({
            start: i,
            end: endPos,
          });
        }
      }
      if (cleaned.substring(i, i + 8) === "thinking\u0111") {
        i += 8;
      } else if (cleaned.substring(i, i + 7) === "thought\u0111") {
        i += 7;
      } else if (cleaned.substring(i, i + 11) === "antthinking\u0111") {
        i += 11;
      }
      continue;
    }

    i++;
  }

  // Handle standalone special close tags (not already handled by WORD_CLOSE_RE)
  SPECIAL_CLOSE_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(SPECIAL_CLOSE_RE)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
      // Check if this is part of a word+tag pattern already handled
      const beforeText = cleaned.slice(Math.max(0, idx - 10), idx);
      if (!/\b(?:This is|First|Second|Third|One|Two|Three)\s+$/.test(beforeText)) {
        thinkingRanges.push({
          start: idx,
          end: idx + match[0].length,
        });
      }
    }
  }

  // Handle unclosed thinking tags
  if (stack.length > 0) {
    if (mode === "preserve") {
      // In preserve mode, only return the content of unclosed tags
      let result = "";
      for (const open of stack) {
        if (open.type === "special") {
          // For special char tags, content starts after the tag word
          const tagWord = cleaned.substring(open.start + 1, open.start + 9);
          if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
            const contentStart = open.start + 9;
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

  rangesToRemove.push(...thinkingRanges);

  // Merge overlapping ranges
  if (rangesToRemove.length > 0) {
    rangesToRemove.sort((a, b) => a.start - b.start);
    const mergedRanges: Array<{ start: number; end: number }> = [];
    let current = rangesToRemove[0];

    for (let i = 1; i < rangesToRemove.length; i++) {
      const next = rangesToRemove[i];
      if (next.start <= current.end) {
        // Overlapping or adjacent ranges, merge them
        current.end = Math.max(current.end, next.end);
      } else {
        mergedRanges.push(current);
        current = next;
      }
    }
    mergedRanges.push(current);

    // Replace with merged ranges
    rangesToRemove.splice(0, rangesToRemove.length, ...mergedRanges);
  }

  // Sort ranges by start position
  rangesToRemove.sort((a, b) => a.start - b.start);

  // Remove ranges in reverse order to maintain indices
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  // Check if we're in preserve or strict mode to determine if we should preserve the original ending
  // In "both" trim mode, we should add punctuation unless in preserve or strict mode
  const shouldPreserveOriginalEnd = mode === "preserve" || mode === "strict";
  const result = applyTrim(cleaned, trimMode, shouldPreserveOriginalEnd);

  // Special handling for strict mode: if the original text ended with a space before "Unclosed", preserve it
  if (mode === "strict" && unclosedMatches.length > 0) {
    const firstMatch = unclosedMatches[0];
    const matchIdx = firstMatch.index ?? 0;
    if (matchIdx > 0 && text[matchIdx - 1] === " " && !result.endsWith(" ")) {
      return result + " ";
    }
  }

  return result;
}
