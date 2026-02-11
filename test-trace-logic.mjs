// Let's manually trace through the function logic
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const SPECIAL_CLOSE_RE = /(?:thinking|thought|antthinking)đ/g;
const SPECIAL_OPEN_RE = /Đ(?:thinking|thought|antthinking)/g;

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

// Test the code regions detection
const test1 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("=== Test 1: Code regions ===");
const regions1 = findCodeRegions(test1);
console.log("Code regions:", regions1);

// Check positions of special characters
for (let i = 0; i < test1.length; i++) {
  if (test1[i] === "đ" || test1[i] === "Đ") {
    console.log(
      `Special char "${test1[i]}" at position ${i}, inside code: ${isInsideCode(i, regions1)}`,
    );
  }
}

// Test the unpairedWordTagRe pattern
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
console.log("\n=== Test unpairedWordTagRe ===");
const testText = "This should be removedđ";
console.log(`Text: "${testText}"`);
console.log(`Matches: ${unpairedWordTagRe.test(testText)}`);

// Test with actual content
const testPhrase = "This should be removedđ";
console.log(`\nTesting phrase: "${testPhrase}"`);
const matches = testPhrase.match(unpairedWordTagRe);
console.log("Matches:", matches);
