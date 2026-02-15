// Test the code block replacement and restoration logic
function findCodeRegions(text) {
  const regions = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  // Find inline code (but not fenced code blocks)
  const inlineRe = /`([^`]+)`/g;
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

console.log("Original:");
console.log(text);
console.log("----------");

// Find code regions
const codeRegions = findCodeRegions(text);
console.log("Code regions:", codeRegions);

// Store original code block content
const codeBlockContents = [];
for (const region of codeRegions) {
  codeBlockContents.push({
    start: region.start,
    end: region.end,
    content: text.slice(region.start, region.end),
  });
}

// Replace code blocks with placeholders
let cleaned = text;
let placeholderIndex = 0;
const placeholders = [];
for (const region of codeRegions.toSorted((a, b) => b.start - a.start)) {
  const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
  const content = cleaned.slice(region.start, region.end);
  placeholders.push({
    index: placeholderIndex,
    content: content,
  });
  cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
  placeholderIndex++;
}

console.log("After replacement:");
console.log(cleaned);
console.log("----------");

// Simulate processing (remove "thinkingđ" outside code blocks)
cleaned = cleaned.replace(/thinkingđ/g, "");

console.log("After processing:");
console.log(cleaned);
console.log("----------");

// Restore code blocks
for (const placeholder of placeholders.toReversed()) {
  const placeholderStr = `__CODE_BLOCK_${placeholder.index}__`;
  const placeholderPos = cleaned.indexOf(placeholderStr);
  if (placeholderPos !== -1) {
    const codeContent = placeholder.content;
    cleaned =
      cleaned.slice(0, placeholderPos) +
      codeContent +
      cleaned.slice(placeholderPos + placeholderStr.length);
  }
}

console.log("After restoration:");
console.log(cleaned);
console.log("----------");

console.log("Contains preserved:", cleaned.includes("This should be preservedđ"));
console.log("Contains removed:", cleaned.includes("This should be removedđ"));
