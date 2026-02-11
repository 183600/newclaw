// Add debug output to understand what's happening

function stripReasoningTagsFromTextWithDebug(text, options = {}) {
  console.log(`\n=== DEBUG: Input "${text}" ===`);

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

  console.log(`After entity conversion: "${cleaned}"`);

  // Find code regions
  const codeRegions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of cleaned.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    codeRegions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /`+[^`]+`+/g;
  for (const match of cleaned.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = codeRegions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      codeRegions.push({ start, end });
    }
  }
  codeRegions.sort((a, b) => a.start - b.start);

  console.log(`Code regions:`, codeRegions);

  const thinkingRanges = [];
  let stack = [];

  // Handle unpaired word tags
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  console.log(`Testing unpairedWordTagRe on: "${cleaned}"`);
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    console.log(
      `Unpaired match: "${match[0]}" at ${idx}, insideCode: ${isInsideCode(idx, codeRegions)}`,
    );

    if (!isInsideCode(idx, codeRegions)) {
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  console.log(`Thinking ranges before removal:`, thinkingRanges);

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(
      `Removing [${range.start}, ${range.end}): "${cleaned.substring(range.start, range.end)}"`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log(`After removal: "${cleaned}"`);

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

  return applyTrim(cleaned, trimMode);
}

// Test with actual content from test file
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "

const test1 = "Before This is thinking" + thinkingCloseTag + " after.";
console.log("Expected result: 'Before  after.'");
const result1 = stripReasoningTagsFromTextWithDebug(test1);
console.log(`Final result: "${result1}"`);
