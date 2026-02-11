// Let's create a simple test to verify the behavior
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// The exact test from the file
const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Test from file ===");
console.log("Input:", JSON.stringify(text));

// Check for special characters
console.log("Has đ:", text.includes(""));
console.log("Has Đ:", text.includes("Đ"));

// Run the function
const result = stripReasoningTagsFromText(text);
console.log("\nResult:", JSON.stringify(result));

// Check what the test expects
console.log("\nTest expects:");
console.log(
  'expect(result).toContain("This should be preserved"):',
  result.includes("This should be preserved"),
);
console.log(
  'expect(result).not.toContain("This should be removed"):',
  !result.includes("This should be removed"),
);

// The vitest error shows:
// AssertionError: expected '```javascript\nfunction test() {\n  /…' not to contain 'This should be removed'

// This means the result contains "This should be removed" (without special character)
// But our result contains it too!

// Let's check if the test file actually has special characters
console.log("\n=== Checking test file ===");
const fs = await import("fs");
const testFileContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const testSection = testFileContent.substring(
  testFileContent.indexOf("should preserve content within code blocks"),
  testFileContent.indexOf("should preserve content within code blocks") + 500,
);

console.log("Test section from file:");
console.log(testSection);

// The issue might be that the test file has literal escape sequences
// But when the test runs, these are not converted to special characters

// Let's manually add the special characters
const textWithSpecial = text.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("\n=== With special characters ===");
console.log("Input:", JSON.stringify(textWithSpecial));
const resultWithSpecial = stripReasoningTagsFromText(textWithSpecial);
console.log("Result:", JSON.stringify(resultWithSpecial));
console.log(
  'Contains "This should be removed":',
  resultWithSpecial.includes("This should be removed"),
);
console.log(
  'Contains "This should be removedđ":',
  resultWithSpecial.includes("This should be removedđ"),
);

// The function works correctly when there are special characters
// The test file might not have them, or they are being processed differently
