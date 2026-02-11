// Let's run the exact test case and see what's happening
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// The exact test case from the file
const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// The actual test expects the special characters
const textWithSpecialChars = text.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("Input:");
console.log(JSON.stringify(textWithSpecialChars));

const result = stripReasoningTagsFromText(textWithSpecialChars);
console.log("\nOutput:");
console.log(JSON.stringify(result));

console.log("\nChecking expectations:");
console.log('Contains "This should be preserved"', result.includes("This should be preserved"));
console.log('Contains "This should be preservedđ"', result.includes("This should be preservedđ"));
console.log('Contains "This should be removed"', result.includes("This should be removed"));
console.log('Contains "This should be removedđ"', result.includes("This should be removedđ"));

// The test expects:
// expect(result).toContain("This should be preserved");
// expect(result).not.toContain("This should be removed");
console.log("\nTest expectations:");
console.log(
  'Should contain "This should be preserved":',
  result.includes("This should be preserved"),
);
console.log(
  'Should NOT contain "This should be removed":',
  !result.includes("This should be removed"),
);

// Let's also test what the test is actually checking
console.log("\nActual test assertions:");
console.log(
  'expect(result).toContain("This should be preserved"):',
  result.includes("This should be preserved"),
);
console.log(
  'expect(result).not.toContain("This should be removed"):',
  !result.includes("This should be removed"),
);

// The issue might be that the test is looking for "This should be preserved" without the special character
// But our output contains "This should be preservedđ" with the special character
console.log("\nAnalysis:");
console.log('The test expects to find "This should be preserved" (without đ)');
console.log('But the result contains "This should be preservedđ" (with đ)');
console.log("This mismatch causes the test to fail!");
