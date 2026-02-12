import { stripReasoningTagsFromText } from './src/shared/text/reasoning-tags.ts';

// Simple test case
const text = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(text));
console.log("Output (preserve):", JSON.stringify(stripReasoningTagsFromText(text, { mode: "preserve" })));
console.log("Output (strict):", JSON.stringify(stripReasoningTagsFromText(text, { mode: "strict" })));

// Test case 2: Code blocks
console.log("\n=== Code blocks ===");
const text2 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

console.log("Input:", JSON.stringify(text2));
console.log("Output:", JSON.stringify(stripReasoningTagsFromText(text2)));

// Test case 3: Inline code
console.log("\n=== Inline code ===");
const text3 = "Text with \`inline code
\` and outside thinking
.";
console.log("Input:", JSON.stringify(text3));
console.log("Output:", JSON.stringify(stripReasoningTagsFromText(text3)));