// Test specific patterns with đ character

const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test 1 text:");
console.log("Looking for patterns ending with đ:");

// Test pattern that ends with đ
const pattern1 = /.*\u0111/g;
for (const match of text1.matchAll(pattern1)) {
  console.log("Pattern 1 match:", JSON.stringify(match[0]));
}

// Test unpairedWordTagRe
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
console.log("\nTesting unpairedWordTagRe:");
for (const match of text1.matchAll(unpairedWordTagRe)) {
  console.log("Match:", JSON.stringify(match[0]));
}

// Test a simpler pattern that should match
const simplePattern = /\w*\u0111/g;
console.log("\nTesting simple pattern (\w*\u0111):");
for (const match of text1.matchAll(simplePattern)) {
  console.log("Simple match:", JSON.stringify(match[0]));
}

const text2 = "Text with \`inline code\` and outside thinking.";
console.log("\nTest 2 text:");
console.log("Looking for patterns ending with đ:");

for (const match of text2.matchAll(pattern1)) {
  console.log("Pattern 1 match:", JSON.stringify(match[0]));
}

console.log("\nTesting unpairedWordTagRe:");
for (const match of text2.matchAll(unpairedWordTagRe)) {
  console.log("Match:", JSON.stringify(match[0]));
}

console.log("\nTesting simple pattern (\w*\u0111):");
for (const match of text2.matchAll(simplePattern)) {
  console.log("Simple match:", JSON.stringify(match[0]));
}
