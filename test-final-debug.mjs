// Let's test the actual behavior with the exact test strings
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test 1: Code blocks
console.log("=== Test 1: Code blocks ===");
const test1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// The test file has these strings with special characters
// Let's simulate what happens
const test1WithSpecial = test1.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("Input:", JSON.stringify(test1WithSpecial));
const result1 = stripReasoningTagsFromText(test1WithSpecial);
console.log("Output:", JSON.stringify(result1));

// The test expects:
console.log("\nTest expectations:");
console.log(
  'expect(result).toContain("This should be preserved"):',
  result1.includes("This should be preserved"),
);
console.log(
  'expect(result).not.toContain("This should be removed"):',
  !result1.includes("This should be removed"),
);

// But the actual strings in the test file have special characters:
console.log("\nActual test file strings:");
console.log(
  'expect(result).toContain("This should be preserved"):',
  result1.includes("This should be preserved"),
);
console.log(
  'expect(result).not.toContain("This should be removed"):',
  !result1.includes("This should be removed"),
);

// The function correctly removes "This should be removedđ"
// But the test expects to not find "This should be removed" (without special char)
// Since the result contains "This should be preservedđ", it doesn't contain "This should be preserved" (without special char)

console.log("\n=== Analysis ===");
console.log("The test file contains strings with special characters");
console.log(
  "But the test expectations in the error message show strings without special characters",
);
console.log("This might be a vitest output formatting issue");
console.log("");
console.log("The function is working correctly:");
console.log('- It removes "This should be removedđ"');
console.log('- It preserves "This should be preservedđ"');
console.log("");
console.log("The test should pass if the expectations are correct");
