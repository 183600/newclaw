// Debug script for code block preservation
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

// Test the fenced code block regex
const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
const matches = [...text.matchAll(fencedRe)];
console.log("\nCode block matches:");
matches.forEach((match, index) => {
  console.log(`Match ${index}:`, JSON.stringify(match[0]));
  console.log(`Start: ${match.index}, End: ${match.index + match[0].length}`);
});

// Test inline code regex
const inlineRe = /`+[^`]+`+/g;
const inlineMatches = [...text.matchAll(inlineRe)];
console.log("\nInline code matches:");
inlineMatches.forEach((match, index) => {
  console.log(`Match ${index}:`, JSON.stringify(match[0]));
  console.log(`Start: ${match.index}, End: ${match.index + match[0].length}`);
});
