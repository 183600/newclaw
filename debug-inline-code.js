// Test inline code case with actual content from hex dump
const testText = "Text with `inline code and outside thinking.";

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

// Check if inline code is protected
const inlineCodeStart = testText.indexOf("`inline code");
const inlineCodeEnd = testText.indexOf("`", inlineCodeStart + 1) + 1;
console.log("Inline code range:", [inlineCodeStart, inlineCodeEnd]);
console.log("Inline code is protected:", isInsideCode(inlineCodeStart, regions));

// Check if the closing tag is protected
const closingTagStart = testText.indexOf("");
console.log("Closing tag range:", [closingTagStart, closingTagStart + "".length]);
console.log("Closing tag is protected:", isInsideCode(closingTagStart, regions));

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
