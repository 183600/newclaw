import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Copy exact content from test file
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
