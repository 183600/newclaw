// Test with actual special characters from the test case
const testText = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test text length:", testText.length);

// Create the text with special characters
const preservedText = "This should be preserved";
const removedText = "This should be removed";

// Add special characters
const actualTestText = testText
  .replace(preservedText, preservedText + "")
  .replace(removedText, removedText + "");

console.log("Actual test text:", JSON.stringify(actualTestText));

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
console.log("Matches:");
for (const match of actualTestText.matchAll(unpairedWordTagRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
}

// Test the specific parts
const preservedIndex = actualTestText.indexOf(preservedText + "");
const removedIndex = actualTestText.indexOf(removedText + "");

console.log("\nPreserved text index:", preservedIndex);
console.log("Removed text index:", removedIndex);

// Test if these match our pattern
const preservedPart = actualTestText.substring(
  preservedIndex,
  preservedIndex + preservedText.length + 1,
);
const removedPart = actualTestText.substring(removedIndex, removedIndex + removedText.length + 1);

console.log("Preserved part:", JSON.stringify(preservedPart));
console.log("Removed part:", JSON.stringify(removedPart));

console.log("Preserved matches pattern:", preservedPart.match(unpairedWordTagRe));
console.log("Removed matches pattern:", removedPart.match(unpairedWordTagRe));
