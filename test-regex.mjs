// Test regex patterns
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const testText1 = "Before This is thinking</thinking> after.";
const testText2 = "Start First thought</thought> middle Second thought</thought> end.";
const testText3 = `
\`\`\`javascript
function test() {
  // This should be preserved</thinking>
  return true;
}
\`\`\`
Outside This should be removed</thinking> code block.`;

console.log("=== Test 1 ===");
console.log("Text:", testText1);
const matches1 = [...testText1.matchAll(HTML_THINKING_TAG_RE)];
console.log("Matches:", matches1);

console.log("\n=== Test 2 ===");
console.log("Text:", testText2);
const matches2 = [...testText2.matchAll(HTML_THINKING_TAG_RE)];
console.log("Matches:", matches2);

console.log("\n=== Test 3 ===");
console.log("Text:", testText3);
const matches3 = [...testText3.matchAll(HTML_THINKING_TAG_RE)];
console.log("Matches:", matches3);

// Test code block detection
function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
    console.log("Fenced block at", start, "-", start + match[0].length);
  }
  return regions;
}

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

console.log("\n=== Code block detection for Test 3 ===");
const regions3 = findCodeRegions(testText3);
console.log("Code regions:", regions3);

for (const match of matches3) {
  const idx = match.index ?? 0;
  console.log(`Match "${match[0]}" at index ${idx}, isInsideCode: ${isInsideCode(idx, regions3)}`);
}
