// Let's debug the actual failing tests
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// From vitest output:
// Test 1: expected '```javascript\nfunction test() {\n  /…' not to contain 'This should be removed'
// - Expected
// + Received
// - This should be removed
// + ```javascript
// + function test() {
// +   // This should be preserved
// +   return true;
// + }
// + ```
// + Outside This should be removed code block.

// This means the result contains "This should be removed" with special character
// But the test expects it NOT to contain this

console.log("=== Debugging Test 1 ===");
const test1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// The test must be adding special characters
// Let's check what the actual test does
console.log("Original test string:");
console.log(JSON.stringify(test1));

// The test failure shows the result contains "This should be removed"
// But the input does not have special characters
// So either:
// 1. The test is adding special characters
// 2. The function is adding special characters

// Let's check the function
const result1 = stripReasoningTagsFromText(test1);
console.log("\nFunction output:");
console.log(JSON.stringify(result1));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));

// The function does not modify the input when there are no special characters
// So the test must be adding special characters somewhere

console.log("\n=== Conclusion ===");
console.log("The test file contains literal strings with escape sequences");
console.log("But these are not being converted to special characters");
console.log("The function only processes when special characters are present");
console.log("");
console.log("The issue might be in how vitest is running the tests");
console.log("Or the test expectations are wrong");
