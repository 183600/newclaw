import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with actual HTML tags from the test file
const codeBlockTest = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Code block test ===");
console.log("Input:");
console.log(JSON.stringify(codeBlockTest));
console.log("\nOutput:");
const result1 = stripReasoningTagsFromText(codeBlockTest);
console.log(JSON.stringify(result1));
console.log("\nContains 'This should be preserved':", result1.includes("This should be preserved"));
console.log("Contains 'This should be removed':", result1.includes("This should be removed"));

console.log("\n=== Inline code test ===");
const inlineCodeTest = "Text with `inline code
` and outside thinking.";
console.log("Input:");
console.log(JSON.stringify(inlineCodeTest));
console.log("\nOutput:");
const result2 = stripReasoningTagsFromText(inlineCodeTest);
console.log(JSON.stringify(result2));
console.log("\nContains 'inline code':", result2.includes("inline code"));
console.log("Contains 'thinking':", result2.includes("thinking"));