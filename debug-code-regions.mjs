// Test findCodeRegions function

function findCodeRegions(text) {
  const regions = [];

  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
    console.log("Fenced code block:", { start, end: start + match[0].length, content: match[0] });
  }

  const inlineRe = /`[^`]+`/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = regions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      regions.push({ start, end });
      console.log("Inline code:", { start, end, content: match[0] });
    }
  }

  regions.sort((a, b) => a.start - b.start);
  return regions;
}

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

// Test case 1: Code blocks
const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test 1: Code blocks");
console.log("Text:", JSON.stringify(text1));
const regions1 = findCodeRegions(text1);
console.log("Regions:", regions1);

// Check if specific positions are inside code
const preservedIndex = text1.indexOf("This should be preserved");
const removedIndex = text1.indexOf("This should be removed");
console.log(
  "Preserved index:",
  preservedIndex,
  "isInsideCode:",
  isInsideCode(preservedIndex, regions1),
);
console.log("Removed index:", removedIndex, "isInsideCode:", isInsideCode(removedIndex, regions1));

console.log("\n--------------------------------\n");

// Test case 2: Inline code
const text2 = "Text with \`inline code\` and outside thinking.";
console.log("Test 2: Inline code");
console.log("Text:", JSON.stringify(text2));
const regions2 = findCodeRegions(text2);
console.log("Regions:", regions2);

// Check if specific positions are inside code
const inlineIndex = text2.indexOf("inline code");
console.log("Inline index:", inlineIndex, "isInsideCode:", isInsideCode(inlineIndex, regions2));
