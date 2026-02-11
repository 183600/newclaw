// Test code regions detection
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

// Test case from the failing test
const testText = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test text:", JSON.stringify(testText));
console.log("Length:", testText.length);

const regions = findCodeRegions(testText);
console.log("Code regions:", regions);

// Check if "This should be removed" is inside code region
const removedIndex = testText.indexOf("This should be removed");
console.log("Index of 'This should be removed':", removedIndex);
console.log("Is inside code:", isInsideCode(removedIndex, regions));

// Check each character around the problematic area
for (let i = removedIndex - 5; i <= removedIndex + 5; i++) {
  if (i >= 0 && i < testText.length) {
    const char = testText[i];
    const inside = isInsideCode(i, regions);
    console.log(`[${i}]: "${char}" (${char.charCodeAt(0)}) - inside code: ${inside}`);
  }
}
