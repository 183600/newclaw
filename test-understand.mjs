// Let's test what the function should actually do
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

console.log("=== Understanding the test expectations ===\n");

// Test 2: Inline code
console.log("Test 2: Inline code preservation");
console.log("Input has special characters but output should not");
const test2 = "Text with `inline code` and outside thinking.";
console.log("Input:", JSON.stringify(test2));
const result2 = stripReasoningTagsFromText(test2);
console.log("Output:", JSON.stringify(result2));
console.log('Expected to contain: "inline code" (without special char)');
console.log('Actual contains "inline code":', result2.includes("inline code"));
console.log('Actual contains "inline code":', result2.includes("inline code"));
console.log("");

// The issue is that the function is removing the entire word "thinking"
// when it encounters the special character, but it should only remove
// the special character and keep the word.

// Let's test the fix
console.log("=== Testing the fix ===\n");

// We need to update the function to handle arbitrary words with special characters
// The current implementation only removes specific words like "thinking", "thought", etc.
// But the tests use arbitrary words like "inline code" and "removed" with special characters

// The fix should be:
// 1. When we find a special character đ at position i
// 2. Look backwards to find the word boundary
// 3. Remove only the special character, not the entire word

console.log("The function needs to be updated to handle arbitrary words with special characters.");
console.log('Currently it only handles specific words like "thinking", "thought", "antthinking".');
