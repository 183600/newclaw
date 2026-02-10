export type ReasoningTagMode = "strict" | "preserve";
export type ReasoningTagTrim = "none" | "start" | "both";

const QUICK_TAG_RE = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

interface CodeRegion {
  start: number;
  end: number;
}

function findCodeRegions(text: string): CodeRegion[] {
  const regions: CodeRegion[] = [];

  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  fencedRe.lastIndex = 0; // Reset lastIndex before matching
  for (const match of text.matchAll(fencedRe)) {
    const start = (match.index ?? 0) + match[1].length;
    regions.push({ start, end: start + match[0].length - match[1].length });
  }

  const inlineRe = /`+[^`]+`+/g;
  inlineRe.lastIndex = 0; // Reset lastIndex before matching
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
  if (FINAL_TAG_RE.test(cleaned)) {
    FINAL_TAG_RE.lastIndex = 0;
    const preCodeRegions = findCodeRegions(cleaned);
    const finalRanges: Array<{ start: number; end: number; inCode: boolean }> = [];
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
          inCode: false,
        });
      }
    }

    // Remove final ranges in reverse order to maintain indices
    for (let i = finalRanges.length - 1; i >= 0; i--) {
      const range = finalRanges[i];
      if (!range.inCode) {
        cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
      }
    }
  } else {
    FINAL_TAG_RE.lastIndex = 0;
  }

  const codeRegions = findCodeRegions(cleaned);

  THINKING_TAG_RE.lastIndex = 0;
  let result = "";
  let lastIndex = 0;
  let inThinking = false;
  let thinkingStart = -1;

  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    if (!inThinking) {
      if (!isClose) {
        // This is an opening tag, add content before it and start skipping
        // For trim="none", we skip the content before thinking blocks
        // to preserve only the spacing of the actual content
        if (trimMode !== "none") {
          const beforeContent = cleaned.slice(lastIndex, idx);
          result += beforeContent;
        }
        inThinking = true;
        thinkingStart = idx;
      }
      // For malformed closing tags without opening, skip them by just moving lastIndex
      lastIndex = idx + match[0].length;
    } else {
      // We're inside a thinking block
      if (isClose) {
        // This is a closing tag, stop skipping
        inThinking = false;
        thinkingStart = -1;
      }
      lastIndex = idx + match[0].length;
    }
  }

  if (inThinking) {
    if (mode === "preserve") {
      // In preserve mode, keep the unclosed thinking tag and its content
      result += cleaned.slice(thinkingStart >= 0 ? thinkingStart : lastIndex);
    } else {
      // In strict mode, drop the unclosed thinking content
      // Don't add anything
    }
  } else {
    // Add any remaining content after the last tag
    let remaining = cleaned.slice(lastIndex);

    // If we're in strict mode and just removed a thinking block,
    // clean up potential double newlines
    if (mode === "strict" && remaining) {
      // Check if the character before the removed block was a newline
      // and the character after is also a newline
      const beforeChar = result.length > 0 ? result[result.length - 1] : "";
      const afterChar = remaining[0] || "";

      if (beforeChar === "\n" && afterChar === "\n") {
        // Remove one of the newlines to avoid empty lines
        remaining = remaining.slice(1);
      }
    }

    result += remaining;
  }

  return applyTrim(result, trimMode);
}
