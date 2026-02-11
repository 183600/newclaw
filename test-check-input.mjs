// Let's check if the function is being called with the right input
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

console.log("=== Checking if the function is called with special characters ===\n");

// Let's simulate what vitest does
// The test file has escape sequences that get parsed

// Test 1: The test file has:
// const text = `
// \`\`\`javascript
// function test() {
//   // This should be preserved
//   return true;
// }
// \`\`\`
// Outside This should be removed code block.`;

// But the actual test expects special characters
// So when vitest runs, it must be converting the escape sequences

// Let's check what the function actually receives
const test1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// In JavaScript, the backslash-u escape sequences would be parsed
// But in the test file, they're literal backslashes
const actualTest1 = test1.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("Test 1 input:", JSON.stringify(actualTest1));
console.log("Has đ character:", actualTest1.includes("đ"));

const result1 = stripReasoningTagsFromText(actualTest1);
console.log("Test 1 output:", JSON.stringify(result1));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));
console.log('Contains "This should be removedđ":', result1.includes("This should be removedđ"));
console.log("");

// Test 2
const test2 = "Text with \\`inline code\\` and outside thinking\\.";
// This has literal backslashes, not special characters
console.log("Test 2 input (literal backslashes):", JSON.stringify(test2));
console.log("Has đ character:", test2.includes("đ"));

// If the test is not adding special characters, then the function won't do anything
const result2 = stripReasoningTagsFromText(test2);
console.log("Test 2 output:", JSON.stringify(result2));
console.log("");

// So the issue might be that the test is not actually adding special characters
// Let's check what vitest actually does

console.log("=== Conclusion ===");
console.log("The test file contains escape sequences (\\\\u0111, \\\\u0110)");
console.log("But these are literal backslashes, not actual special characters");
console.log("The function only processes text with actual special characters");
console.log("So the tests are failing because the input doesn't have special characters");
console.log("");
console.log("The fix is to update the function to handle the escape sequences");
console.log("or to ensure the tests use actual special characters");
