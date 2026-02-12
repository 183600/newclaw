// Test findCodeRegions function
function findCodeRegions(text) {
  const regions = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  // Find inline code (but not fenced code blocks)
  // Use a more precise regex that handles consecutive backticks correctly
  const inlineRe = /`([^`\n]+)`/g;
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

// Test case from the file
const text = 'Text with `inline code

console.log('Input:', JSON.stringify(text));
console.log('Length:', text.length);

const codeRegions = findCodeRegions(text);
console.log('Code regions:', codeRegions);

// Check what the inline code should be
const inlineCodeStart = 10;
const inlineCodeEnd = 26;
const inlineCode = text.slice(inlineCodeStart, inlineCodeEnd);
console.log('Inline code (10-26):', JSON.stringify(inlineCode));
