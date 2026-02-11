// Test code block preservation
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

console.log("Test 3:", test3);
console.log("Contains thinking</t>:", test3.includes("thinking</t>"));

// Check if our regex matches inside code blocks
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
const matches = [...test3.matchAll(unpairedWordTagRe)];
console.log("Matches:", matches);

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i + 1}:`, match[0]);
  console.log(`  Index:`, match.index);
  console.log(`  Before context:`, test3.substring(Math.max(0, match.index - 10), match.index));
}
