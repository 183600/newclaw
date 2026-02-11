// Test unpairedWordTagRe with code block test case
const testText = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test text:", JSON.stringify(testText));

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Matches:");
for (const match of testText.matchAll(unpairedWordTagRe)) {
  console.log("  Match:", match[0]);
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}

// Test specifically the "This should be removed" part
const targetText = "This should be removed";
const targetIndex = testText.indexOf(targetText);
console.log("\nTarget text:", targetText);
console.log("Target index:", targetIndex);
console.log("Context around target:");
const context = testText.substring(targetIndex - 10, targetIndex + targetText.length + 10);
console.log("Context:", JSON.stringify(context));

// Test if the target text matches our pattern
const targetMatch = targetText.match(unpairedWordTagRe);
console.log("Target matches pattern:", targetMatch);
