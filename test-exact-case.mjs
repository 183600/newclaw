// Let's directly test the function with the exact test case
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test case from the test file
const test = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// Add the special characters
const testWithSpecialChars = test.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("Test input:");
console.log(JSON.stringify(testWithSpecialChars));

const result = stripReasoningTagsFromText(testWithSpecialChars);
console.log("\nResult:");
console.log(JSON.stringify(result));

console.log('\nExpected result should contain "preservedđ"');
console.log('Expected result should not contain "removedđ"');
console.log('Result contains "preservedđ":', result.includes("preservedđ"));
console.log('Result contains "removedđ":', result.includes("removedđ"));

// Let's also test the individual parts
console.log("\n=== Testing individual patterns ===");
const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[đĐ]|(?:Đ)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/i;

console.log("QUICK_TAG_RE test:", QUICK_TAG_RE.test(testWithSpecialChars));

// Check each special character
for (let i = 0; i < testWithSpecialChars.length; i++) {
  if (testWithSpecialChars[i] === "đ") {
    const wordStart = i;
    let wordEnd = i;
    while (wordEnd >= 0 && /[a-zA-Z]/.test(testWithSpecialChars[wordEnd])) {
      wordEnd--;
    }
    const word = testWithSpecialChars.substring(wordEnd + 1, i + 1);
    console.log(`Found "${word}" ending at position ${i}`);
  }
}
