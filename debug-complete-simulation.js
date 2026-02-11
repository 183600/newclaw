// Complete simulation of stripReasoningTagsFromText to debug the issue

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

function simulateStripReasoningTagsFromText(text, options = {}) {
  console.log(`\n=== Simulating: "${text}" ===`);

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  let cleaned = text;

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  console.log(`After entity conversion: "${cleaned}"`);

  // Handle thinking tags
  const codeRegions = findCodeRegions(cleaned);
  console.log(`Code regions:`, codeRegions);

  const thinkingRanges = [];
  let stack = [];

  // Find all HTML thinking tags
  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
  for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    console.log(
      `HTML tag: "${match[0]}" at ${idx}, isClose: ${isClose}, insideCode: ${isInsideCode(idx, codeRegions)}`,
    );

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

  console.log(`After HTML processing, stack:`, stack);
  console.log(`Thinking ranges from HTML:`, thinkingRanges);

  // Handle unpaired word tags
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  for (const match of cleaned.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    console.log(
      `Unpaired match: "${match[0]}" at ${idx}, insideCode: ${isInsideCode(idx, codeRegions)}`,
    );

    if (!isInsideCode(idx, codeRegions)) {
      // Remove the entire match
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  console.log(`All thinking ranges:`, thinkingRanges);

  // Sort ranges by start position
  thinkingRanges.sort((a, b) => a.start - b.start);
  console.log(`Sorted thinking ranges:`, thinkingRanges);

  // Remove thinking ranges in reverse order to maintain indices
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(
      `Removing range [${range.start}, ${range.end}): "${cleaned.substring(range.start, range.end)}"`,
    );
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  }

  console.log(`After removal: "${cleaned}"`);

  const result = applyTrim(cleaned, trimMode);
  console.log(`After trim (${trimMode}): "${result}"`);

  return result;
}

// Test the failing cases with exact content from test file
simulateStripReasoningTagsFromText("Before This is thinking after.");
simulateStripReasoningTagsFromText("Start First thought middle Second thought end.");
simulateStripReasoningTagsFromText("Text with `inline code` and outside thinking.");
