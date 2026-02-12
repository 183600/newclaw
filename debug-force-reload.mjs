// Test with forced module reload
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test HTML entity conversion with the actual function
const testText = "This should be preserved&#x111; and this should be removed&#x111;";

console.log("=== Testing with Forced Module Reload ===");
console.log("Input:", JSON.stringify(testText));

// Test with the actual function
const result = stripReasoningTagsFromText(testText);
console.log("Function output:", JSON.stringify(result));
console.log('Contains "preserved":', result.includes("preserved"));
console.log('Contains "removed":', result.includes("removed"));
console.log('Contains "preservedđ":', result.includes("preservedđ"));
console.log('Contains "removedđ":', result.includes("removedđ"));

// Test with code blocks
const codeBlockText = `
\`\`\`javascript
function test() {
  // This should be preserved&#x111;
  return true;
}
\`\`\`
Outside This should be removed&#x111; code block.`;

console.log("\n=== Code Block Test ===");
console.log("Input:", JSON.stringify(codeBlockText));
const codeBlockResult = stripReasoningTagsFromText(codeBlockText);
console.log("Function output:", JSON.stringify(codeBlockResult));
console.log(
  'Contains "This should be preserved":',
  codeBlockResult.includes("This should be preserved"),
);
console.log(
  'Contains "This should be removed":',
  codeBlockResult.includes("This should be removed"),
);
