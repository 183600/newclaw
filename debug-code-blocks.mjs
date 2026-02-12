// Debug script to understand code block detection
function findCodeRegions(text) {
  const regions = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
    console.log("Fenced block:", match[0], "at", start, "-", start + match[0].length);
  }

  // Find inline code
  const inlineRe = /`+[^`]+`+/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = regions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      regions.push({ start, end });
      console.log("Inline code:", match[0], "at", start, "-", end);
    }
  }

  regions.sort((a, b) => a.start - b.start);
  return regions;
}

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved&#x111;
  return true;
}
\`\`\`
Outside This should be removed&#x111; code block.`;

console.log("=== Analyzing code blocks ===");
console.log("Text:", text3);
console.log("Text length:", text3.length);
const regions = findCodeRegions(text3);
console.log("Code regions:", regions);

// Check if "Outside This should be removed" is inside a code region
const removedText = "This should be removed&#x111;";
const idx = text3.indexOf(removedText);
console.log("\nIndex of removed text:", idx);
console.log("Is inside code region:", isInsideCode(idx, regions));

// Check character by character around the removed text
console.log("\nContext around removed text:");
const start = Math.max(0, idx - 10);
const end = Math.min(text3.length, idx + removedText.length + 10);
const context = text3.slice(start, end);
console.log("Context:", context);
console.log(
  "Context chars:",
  [...context].map((c, i) => `${c} (${start + i})`),
);
