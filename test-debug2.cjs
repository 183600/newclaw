const { stripReasoningTagsFromText } = require("./src/shared/text/reasoning-tags.ts");

// Test case from the file
const fs = require("fs");
const testContent = fs.readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");
const testLine = lines.find((line) => line.includes('const text = \"Text with'));
const match = testLine.match(/const text = \"(.*)\";/);
const text = match[1];

// Now evaluate the string with escape sequences
const actualText = eval('\"' + text + '\"');
console.log("Actual input:", JSON.stringify(actualText));

// Let's trace through the function step by step
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

const codeRegions = findCodeRegions(actualText);
console.log("Code regions:", codeRegions);

// Check what's in the code region
if (codeRegions.length > 0) {
  const region = codeRegions[0];
  const content = actualText.slice(region.start, region.end);
  console.log("Code region content:", JSON.stringify(content));
}
