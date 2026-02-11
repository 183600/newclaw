// Test the complete function with correct strings

function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
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

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

function applyTrim(value, mode) {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  return value.trim();
}

function stripReasoningTagsFromText(text, options = {}) {
  if (!text) {
    return text;
  }

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  const codeRegions = findCodeRegions(cleaned);
  const thinkingRanges = [];
  let stack = [];

  // Find all HTML thinking tags
  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
    }
  }

  // Find all special character thinking tags
  let i = 0;
  while (i < cleaned.length) {
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

    if (
      i + 7 < cleaned.length &&
      (cleaned.substring(i, i + 8) === "thinking\u0111" ||
        cleaned.substring(i, i + 7) === "thought\u0111")
    ) {
      if (!isInsideCode(i, codeRegions)) {
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
      let result = "";
      for (const open of stack) {
        if (open.type === "special") {
          const tagWord = cleaned.substring(open.start + 1, open.start + 8);
          if (tagWord === "thinking" || tagWord === "thought") {
            const contentStart = open.start + 8;
            result += cleaned.slice(contentStart);
          }
        } else {
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const contentStart = open.start + tagMatch[0].length;
            result += cleaned.slice(contentStart);
          }
        }
      }
      return applyTrim(result, trimMode);
    } else if (mode === "strict") {
      for (const open of stack) {
        if (open.type === "special") {
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
          const tagMatch = cleaned.slice(open.start).match(/^<[^>]*>/);
          if (tagMatch) {
            const tagEnd = open.start + tagMatch[0].length;
            const remainingContent = cleaned.slice(tagEnd);
            const newlineIndex = remainingContent.indexOf("\n");

            if (newlineIndex !== -1) {
              thinkingRanges.push({
                start: open.start,
                end: tagEnd + newlineIndex,
              });
            } else {
              thinkingRanges.push({
                start: open.start,
                end: cleaned.length,
              });
            }
          } else {
            thinkingRanges.push({
              start: open.start,
              end: cleaned.length,
            });
          }
        }
      }
    }
  }

  // Handle unpaired word tags
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    if (!isInsideCode(idx, codeRegions)) {
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

// Test with correct strings
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "

const testCases = [
  {
    name: "should remove simple thinking tags",
    input: "Before This is thinking" + thinkingCloseTag + " after.",
    expected: "Before  after.",
  },
  {
    name: "should handle multiple thinking blocks",
    input:
      "Start First thought" +
      thinkingCloseTag +
      " middle Second thought" +
      thinkingCloseTag +
      " end.",
    expected: "Start  middle  end.",
  },
];

for (const testCase of testCases) {
  console.log(`\n=== ${testCase.name} ===`);
  console.log(`Input: "${testCase.input}"`);
  console.log(`Expected: "${testCase.expected}"`);

  const result = stripReasoningTagsFromText(testCase.input);
  console.log(`Actual: "${result}"`);
  console.log(`Pass: ${result === testCase.expected}`);
}
