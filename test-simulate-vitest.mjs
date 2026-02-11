// Let's simulate exactly what vitest does
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

console.log("=== Simulating vitest test ===\n");

// Test 1: From the test file
// const text = `
// \`\`\`javascript
// function test() {
//   // This should be preserved
//   return true;
// }
// \`\`\`
// Outside This should be removed code block.`;

// In the test file, these are literal strings with escape sequences
// But when TypeScript/JavaScript processes them, they become actual strings

// Let's create the exact string as it would be in the test
const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Test string (as in test file):");
console.log(JSON.stringify(text));

// Now, the test seems to be failing because the result contains "This should be removed"
// But our function should remove it if there's a special character

// Let's check if there's a special character in the test string
console.log("\nHas đ character:", text.includes(""));
console.log("Has Đ character:", text.includes("Đ"));

// The test string doesn't have special characters!
// So the function won't do anything
const result = stripReasoningTagsFromText(text);
console.log("\nFunction result:");
console.log(JSON.stringify(result));
console.log('Contains "This should be removed":', result.includes("This should be removed"));

// The test failure shows the result contains "This should be removed"
// But our function doesn't modify the input when there are no special characters
// This means the test input must have special characters somewhere

console.log("\n=== Conclusion ===");
console.log("The test file contains literal strings");
console.log("But when vitest runs, it must be processing them differently");
console.log('The test failure shows the result contains "This should be removed"');
console.log("But our function only removes text with special characters");
console.log("");
console.log("This suggests:");
console.log("1. The test input has special characters (not visible in the source)");
console.log("2. Or the test expectations are wrong");
console.log("3. Or there is a bug in how the function is called");

// Let's check what happens if we add the special character
const textWithSpecial = text.replace("removed", "removedđ");
console.log("\nWith special character:");
console.log(JSON.stringify(textWithSpecial));
const resultWithSpecial = stripReasoningTagsFromText(textWithSpecial);
console.log("Result with special:");
console.log(JSON.stringify(resultWithSpecial));
console.log(
  'Contains "This should be removed":',
  resultWithSpecial.includes("This should be removed"),
);
console.log(
  'Contains "This should be removedđ":',
  resultWithSpecial.includes("This should be removedđ"),
);
