// Debug the full function step by step
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const testText = `
\`\`\`javascript
function test() {
  // This should be preserved</thinking>
  return true;
}
\`\`\`
Outside This should be removed</thinking> code block.`;

console.log("=== Input ===");
console.log(testText);

// Manually implement the function logic step by step
let cleaned = testText;

// Step 1: HTML entity conversion
console.log("\n=== Step 1: HTML Entity Conversion ===");
cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");
console.log("After HTML entity conversion (no change expected):", cleaned === testText);

// Step 2: Find code regions
console.log("\n=== Step 2: Find Code Regions ===");
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
console.log("Code regions:", codeRegions);

// Step 3: Find HTML thinking tags
console.log("\n=== Step 3: Find HTML Thinking Tags ===");
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const thinkingRanges = [];
let stack = [];

for (const match of cleaned.matchAll(HTML_THINKING_TAG_RE)) {
  const idx = match.index ?? 0;
  const isClose = match[1] === "/";

  console.log(`Found tag "${match[0]}" at index ${idx}, isClose: ${isClose}`);

  if (isInsideCode(idx, codeRegions)) {
    console.log("  -> Inside code block, skipping");
    continue;
  }

  if (!isClose) {
    stack.push({ start: idx, type: "html" });
    console.log("  -> Added to stack");
  } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
    const open = stack.pop();
    thinkingRanges.push({
      start: open.start,
      end: idx + match[0].length,
    });
    console.log(
      `  -> Matched with open tag at ${open.start}, range: ${open.start}-${idx + match[0].length}`,
    );
  } else {
    console.log("  -> No matching open tag");
  }
}

console.log("Final thinking ranges:", thinkingRanges);
console.log("Remaining stack:", stack);

// Step 4: Remove ranges
console.log("\n=== Step 4: Remove Ranges ===");
let finalText = cleaned;
const rangesToRemove = [...thinkingRanges];
rangesToRemove.sort((a, b) => a.start - b.start);

for (let i = rangesToRemove.length - 1; i >= 0; i--) {
  const range = rangesToRemove[i];
  console.log(
    `Removing range ${range.start}-${range.end}: "${finalText.slice(range.start, range.end)}"`,
  );
  finalText = finalText.slice(0, range.start) + finalText.slice(range.end);
}

console.log("\n=== Final Result ===");
console.log(finalText);

// Compare with actual function
console.log("\n=== Compare with actual function ===");
const actualResult = stripReasoningTagsFromText(testText);
console.log("Actual result:", actualResult);
console.log("Manual result matches actual:", finalText === actualResult);
