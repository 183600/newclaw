// Debug the exact issue by adding logs to the original function logic

// Copy the original function with debug logs
function debugOriginalFunction(text, options = {}) {
  console.log(`\n=== ORIGINAL FUNCTION DEBUG: "${text}" ===`);

  if (!text) {
    return text;
  }

  const QUICK_TAG_RE =
    /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

  if (!QUICK_TAG_RE.test(text)) {
    console.log("QUICK_TAG_RE test failed, returning original text");
    return text;
  }

  console.log("QUICK_TAG_RE test passed, continuing processing");

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  console.log(`After entity conversion: "${cleaned}"`);

  // Find code regions (simplified)
  const codeRegions = [];
  const inlineRe = /`+[^`]+`+/g;
  for (const match of cleaned.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    codeRegions.push({ start, end });
  }

  console.log(`Code regions:`, codeRegions);

  const thinkingRanges = [];
  let stack = [];

  // Find all HTML thinking tags
  const THINKING_TAG_RE = /<\s*(\/? )\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
  console.log("Processing HTML thinking tags...");
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    console.log(`HTML tag: "${match[0]}" at ${idx}, isClose: ${isClose}`);

    if (isInsideCode(idx, codeRegions)) {
      console.log("  Inside code, skipping");
      continue;
    }

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
      console.log("  Pushed to stack");
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
      console.log(`  Matched with open tag, added range [${open.start}, ${idx + match[0].length})`);
    }
  }

  console.log(`After HTML processing, stack:`, stack);
  console.log(`Thinking ranges from HTML:`, thinkingRanges);

  // Handle unpaired word tags
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  console.log("Processing unpaired word tags...");
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
      console.log(`  Added range [${idx}, ${idx + match[0].length})`);
    }
  }

  console.log(`All thinking ranges:`, thinkingRanges);

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);
  console.log(`Sorted thinking ranges:`, thinkingRanges);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    const removedText = cleaned.substring(range.start, range.end);
    console.log(`Removing range [${range.start}, ${range.end}): "${removedText}"`);
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    console.log(`After removal: "${cleaned}"`);
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

  const result = applyTrim(cleaned, trimMode);
  console.log(`Final result after trim: "${result}"`);

  return result;
}

// Test with actual content
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "</think>"

const test1 = "Before This is thinking" + thinkingCloseTag + " after.";
console.log("Expected: 'Before  after.'");
const result1 = debugOriginalFunction(test1);
console.log(`Actual: "${result1}"`);
console.log(`Match: ${result1 === "Before  after."}`);
