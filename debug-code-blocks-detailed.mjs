// More detailed debug script for code block preservation

// Simulate the findCodeRegions function
function findCodeRegions(text) {
  const regions = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  // Find inline code
  const inlineRe = /(?<!^|\n)`+[^`]+`+(?!$|\n)/g;
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

const text = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Original text:");
console.log(JSON.stringify(text));

const codeRegions = findCodeRegions(text);
console.log("\nCode regions found:");
codeRegions.forEach((region, index) => {
  console.log(`Region ${index}: start=${region.start}, end=${region.end}`);
  console.log(`Content:`, JSON.stringify(text.slice(region.start, region.end)));
});

// Simulate placeholder replacement
let cleaned = text;
let placeholderIndex = 0;
const placeholders = [];

for (const region of codeRegions.sort((a, b) => b.start - a.start)) {
  const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
  placeholders.push({
    index: placeholderIndex,
    content: cleaned.slice(region.start, region.end),
  });
  cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
  placeholderIndex++;
}

console.log("\nText after placeholder replacement:");
console.log(JSON.stringify(cleaned));

console.log("\nPlaceholders:");
placeholders.forEach((p, index) => {
  console.log(`Placeholder ${index}:`, JSON.stringify(p.content));
});

// Check if the text to be removed is still there
console.log('\nContains "This should be removedđ":', cleaned.includes("This should be removedđ"));
console.log('Contains "This should be preservedđ":', cleaned.includes("This should be preservedđ"));
