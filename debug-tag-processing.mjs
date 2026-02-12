// Debug script to understand tag processing
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved&#x111;
  return true;
}
\`\`\`
Outside This should be removed&#x111; code block.`;

console.log("=== Debug tag processing ===");
console.log("Input text:", text3);

// Manually check the conversion process
let cleaned = text3;
console.log("\n=== HTML Entity Conversion ===");
console.log("Before conversion:", cleaned.includes("thinking&#x111;"));

cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

console.log("After conversion:", cleaned.includes("thinkingđ"));
console.log("Converted text:", cleaned);

// Check the patterns
const WORD_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)\u0111/gi;
console.log("\n=== WORD_CLOSE_RE Pattern ===");
console.log("Pattern:", WORD_CLOSE_RE);
const matches = [...cleaned.matchAll(WORD_CLOSE_RE)];
console.log("Matches:", matches);

const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)\u0111/gi;
console.log("\n=== SPECIAL_CLOSE_RE Pattern ===");
console.log("Pattern:", SPECIAL_CLOSE_RE);
const specialMatches = [...cleaned.matchAll(SPECIAL_CLOSE_RE)];
console.log("Special matches:", specialMatches);

// Check if it's in a code region
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

const codeRegions = findCodeRegions(cleaned);
console.log("\n=== Code Regions ===");
console.log("Code regions:", codeRegions);

for (const match of specialMatches) {
  const idx = match.index ?? 0;
  console.log(
    `Match "${match[0]}" at index ${idx}, isInsideCode: ${isInsideCode(idx, codeRegions)}`,
  );
}
