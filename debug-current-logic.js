// Test the current logic with the correct string
const thinkingPart = String.fromCharCode(116, 104, 105, 110, 107, 105, 110, 103); // "thinking"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // ""
const inlineCode = String.fromCharCode(105, 110, 101, 32, 99, 111, 100, 101); // "ine code"
const argClosingTag = String.fromCharCode(60, 47, 97, 114, 103, 95, 118, 97, 108, 117, 101, 62); // ""

const testText = `Text with \`inl${inlineCode}${argClosingTag}\` and outside ${thinkingPart}${closingTag}.`;

console.log("Test text:", JSON.stringify(testText));

// Test code regions detection
function findCodeRegions(text) {
  const regions = [];

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

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

const regions = findCodeRegions(testText);
console.log("Code regions:", regions);

// Test our updated regexes
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
const textWithClosingTagRe =
  /([^\n<>]{5,})(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
for (const match of testText.matchAll(unpairedWordTagRe)) {
  const idx = match.index ?? 0;
  const endIdx = idx + match[0].length;
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Range:", [idx, endIdx]);
  console.log("  Inside code:", isInsideCode(idx, regions));
}

console.log("\nTesting textWithClosingTagRe:");
for (const match of testText.matchAll(textWithClosingTagRe)) {
  const idx = match.index ?? 0;
  const endIdx = idx + match[0].length;
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Range:", [idx, endIdx]);
  console.log("  Start inside code:", isInsideCode(idx, regions));
  console.log("  End inside code:", isInsideCode(endIdx - 1, regions));
}

// Simulate the updated processing
console.log("\nSimulating updated processing:");
const thinkingRanges = [];

for (const match of testText.matchAll(unpairedWordTagRe)) {
  const idx = match.index ?? 0;
  if (!isInsideCode(idx, regions)) {
    thinkingRanges.push({
      start: idx,
      end: idx + match[0].length,
    });
  }
}

for (const match of testText.matchAll(textWithClosingTagRe)) {
  const idx = match.index ?? 0;
  const endIdx = idx + match[0].length;

  // Skip if any part of the match is inside a code region
  if (isInsideCode(idx, regions) || isInsideCode(endIdx - 1, regions)) {
    console.log(`  Skipping match ${JSON.stringify(match[0])} - overlaps with code region`);
    continue;
  }

  // Check if this overlaps with any existing ranges
  const overlaps = thinkingRanges.some(
    (range) =>
      (idx >= range.start && idx < range.end) ||
      (endIdx > range.start && endIdx <= range.end) ||
      (idx <= range.start && endIdx >= range.end),
  );

  if (!overlaps) {
    thinkingRanges.push({
      start: idx,
      end: endIdx,
    });
  } else {
    console.log(`  Skipping match ${JSON.stringify(match[0])} - overlaps with existing range`);
  }
}

console.log("Final thinking ranges:", thinkingRanges);

// Remove ranges in reverse order
let result = testText;
for (let i = thinkingRanges.length - 1; i >= 0; i--) {
  const range = thinkingRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}

console.log("Final result:", JSON.stringify(result));
