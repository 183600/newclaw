// Create test with actual tags from hex
const hex1 = "7072657365727665643c2f7468696e6b3e"; // preserved</thinking>
const hex2 = "72656d6f7665643c2f7468696e6b3e"; // removed</thinking>

// Convert hex to string
const tag1 = Buffer.from(hex1, "hex").toString("utf8");
const tag2 = Buffer.from(hex2, "hex").toString("utf8");

// Create test with these tags
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved${tag1}
  return true;
}
\`\`\`
Outside This should be removed${tag2} code block.`;

// Import the findCodeRegions function
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

console.log("Test 3:", test3);

// Check code regions
const codeRegions = findCodeRegions(test3);
console.log("\nCode regions:", codeRegions);

// Check for thinking tags
const thinkingTagRe = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>/gi;
const matches = [...test3.matchAll(thinkingTagRe)];

console.log("\nThinking tag matches:");
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i + 1}:`, match[0]);
  console.log(`  Index:`, match.index);
  console.log(`  Is inside code:`, isInsideCode(match.index, codeRegions));
  console.log(`  Before context:`, test3.substring(Math.max(0, match.index - 10), match.index));
  console.log(
    `  After context:`,
    test3.substring(
      match.index + match[0].length,
      Math.min(test3.length, match.index + match[0].length + 10),
    ),
  );
}
