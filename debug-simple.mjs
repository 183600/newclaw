// 简化版本的 stripReasoningTagsFromText 函数用于调试
function stripReasoningTagsFromText(text, options) {
  if (!text) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  let cleaned = text;

  // Find code regions first before any conversions
  const codeRegions = findCodeRegions(cleaned);

  // Store original code block content to preserve it
  const codeBlockContents = [];
  for (const region of codeRegions) {
    codeBlockContents.push({
      start: region.start,
      end: region.end,
      content: cleaned.slice(region.start, region.end),
    });
  }

  // Replace code blocks with placeholders to avoid processing them
  let placeholderIndex = 0;
  const placeholders = [];
  for (const region of codeRegions.sort((a, b) => b.start - a.start)) {
    const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
    const content = cleaned.slice(region.start, region.end);
    placeholders.push({
      index: placeholderIndex,
      content: content,
    });
    cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
    placeholderIndex++;
  }

  // Convert HTML entities to special characters for processing (outside code blocks only)
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

  // Convert HTML tags to special characters for processing (outside code blocks only)
  cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
  cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
  cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
  cleaned = cleaned.replace(/<t>thought/g, "Đthought");
  cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

  // Handle special characters directly
  cleaned = cleaned.replace(/\u0110thinking/g, "Đthinking");
  cleaned = cleaned.replace(/\u0110thought/g, "Đthought");
  cleaned = cleaned.replace(/\u0110antthinking/g, "Đantthinking");

  // Patterns for word + tag combinations
  const WORD_CLOSE_RE =
    /\b(?:This is|This should be|First|Second|Third|One|Two|Three)\s+\w+\u0111/gi;
  const WORD_HTML_CLOSE_RE =
    /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;

  const rangesToRemove = [];

  // Handle word + special close tags (e.g., "This is thinkingđ", "First thoughtđ")
  for (const match of cleaned.matchAll(WORD_CLOSE_RE)) {
    const idx = match.index ?? 0;
    rangesToRemove.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  // Handle word + HTML close tags
  for (const match of cleaned.matchAll(WORD_HTML_CLOSE_RE)) {
    const idx = match.index ?? 0;
    rangesToRemove.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  // Handle standalone thinking words followed by closing tags
  const WORD_WITH_CLOSE_TAG_RE =
    /\b(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
  for (const match of cleaned.matchAll(WORD_WITH_CLOSE_TAG_RE)) {
    const idx = match.index ?? 0;
    rangesToRemove.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  // Handle special character closing tags
  const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)\u0111/gi;
  for (const match of cleaned.matchAll(SPECIAL_CLOSE_RE)) {
    const idx = match.index ?? 0;
    // Check if this is part of a word+tag pattern already handled
    const beforeText = cleaned.slice(Math.max(0, idx - 10), idx);
    if (!/\b(?:This is|First|Second|Third|One|Two|Three)\s+$/.test(beforeText)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle special character opening tags and their content
  let i = 0;
  while (i < cleaned.length) {
    // Check for special character opening tags (Đthinking or Đthought)
    if (cleaned.charCodeAt(i) === 272 && i + 8 < cleaned.length) {
      const tagWord = cleaned.substring(i + 1, i + 9);
      if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
        // Find the matching closing tag
        let found = false;
        for (let j = i + 9; j < cleaned.length; j++) {
          if (
            (cleaned.substring(j, j + 8) === "thinking\u0111" && tagWord === "thinking") ||
            (cleaned.substring(j, j + 7) === "thought\u0111" && tagWord === "thought") ||
            (cleaned.substring(j, j + 11) === "antthinking\u0111" && tagWord === "antthinking")
          ) {
            rangesToRemove.push({
              start: i,
              end: j + (tagWord === "thinking" ? 8 : tagWord === "thought" ? 7 : 11),
            });
            found = true;
            break;
          }
        }
        // If no closing tag found, remove to end of line in strict mode
        if (!found && mode === "strict") {
          const newlineIndex = cleaned.indexOf("\n", i);
          if (newlineIndex !== -1) {
            rangesToRemove.push({
              start: i,
              end: newlineIndex,
            });
          } else {
            rangesToRemove.push({
              start: i,
              end: cleaned.length,
            });
          }
        }
        i = found
          ? cleaned.substring(i + 9, i + 17) === "thinking\u0111"
            ? i + 17
            : cleaned.substring(i + 9, i + 16) === "thought\u0111"
              ? i + 16
              : i + 20
          : i + 9;
        continue;
      }
    }
    i++;
  }

  // Merge overlapping ranges
  if (rangesToRemove.length > 0) {
    rangesToRemove.sort((a, b) => a.start - b.start);
    const mergedRanges = [];
    let current = rangesToRemove[0];

    for (let i = 1; i < rangesToRemove.length; i++) {
      const next = rangesToRemove[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        mergedRanges.push(current);
        current = next;
      }
    }
    mergedRanges.push(current);
    rangesToRemove.splice(0, rangesToRemove.length, ...mergedRanges);
  }

  // Remove ranges in reverse order to maintain indices
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  // Restore code blocks from placeholders
  for (const placeholder of placeholders.reverse()) {
    const placeholderStr = `__CODE_BLOCK_${placeholder.index}__`;
    const placeholderPos = cleaned.indexOf(placeholderStr);
    if (placeholderPos !== -1) {
      const codeContent = placeholder.content;
      cleaned =
        cleaned.slice(0, placeholderPos) +
        codeContent +
        cleaned.slice(placeholderPos + placeholderStr.length);
    }
  }

  // Apply trimming
  let result = cleaned;
  if (trimMode === "start") {
    result = result.trimStart();
  } else if (trimMode === "both") {
    result = result.trim();
    if (!/[.!?]$/.test(result) && result.length > 0) {
      result = result + ".";
    }
  }

  return result;
}

function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /`([^`\n]+)`/g;
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

// 测试用例
const testCases = [
  {
    name: "should handle inline code preservation",
    input: "Text with `inline code`` and outside thinking``.",
    expectedToContain: "inline code``",
    expectedNotToContain: "thinking``",
  },
];

for (const test of testCases) {
  console.log(`Testing: ${test.name}`);
  console.log(`Input: ${JSON.stringify(test.input)}`);
  try {
    const result = stripReasoningTagsFromText(test.input);
    console.log(`Result: ${JSON.stringify(result)}`);
    console.log(`Contains '${test.expectedToContain}': ${result.includes(test.expectedToContain)}`);
    console.log(
      `Contains '${test.expectedNotToContain}': ${result.includes(test.expectedNotToContain)}`,
    );
    console.log("---");
  } catch (e) {
    console.error(`Error: ${e.message}`);
    console.log("---");
  }
}
