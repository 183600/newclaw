// Test with the correct string from hex values
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

// Test our regexes
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
const textWithClosingTagRe =
  /([^\n<>]{5,})(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
for (const match of testText.matchAll(unpairedWordTagRe)) {
  const idx = match.index ?? 0;
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", idx);
  console.log("  Inside code:", isInsideCode(idx, regions));
}

console.log("\nTesting textWithClosingTagRe:");
for (const match of testText.matchAll(textWithClosingTagRe)) {
  const idx = match.index ?? 0;
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", idx);
  console.log("  Inside code:", isInsideCode(idx, regions));
}

// Simulate the processing
console.log("\nSimulating processing:");
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
  if (!isInsideCode(idx, regions)) {
    const overlaps = thinkingRanges.some(
      (range) =>
        (idx >= range.start && idx < range.end) ||
        (idx + match[0].length > range.start && idx + match[0].length <= range.end),
    );

    if (!overlaps) {
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }
}

console.log("Thinking ranges:", thinkingRanges);

// Remove ranges in reverse order
let result = testText;
for (let i = thinkingRanges.length - 1; i >= 0; i--) {
  const range = thinkingRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}

console.log("Final result:", JSON.stringify(result));
