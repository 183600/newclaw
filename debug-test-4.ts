import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Test case 1: Code blocks with special characters
const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Test 1: Code blocks ===");
console.log("Input:");
console.log(JSON.stringify(text1));
console.log("\nOutput:");
const result1 = stripReasoningTagsFromText(text1);
console.log(JSON.stringify(result1));
console.log('\nContains "This should be preserved":', result1.includes("This should be preserved"));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));

// Test case 2: Inline code with special characters
const text2 = "Text with \`inline code\` and outside thinking.";
console.log("\n=== Test 2: Inline code ===");
console.log("Input:");
console.log(JSON.stringify(text2));
console.log("\nOutput:");
const result2 = stripReasoningTagsFromText(text2);
console.log(JSON.stringify(result2));
console.log('\nContains "inline code":', result2.includes("inline code"));
console.log('Contains "thinking":', result2.includes("thinking"));

// Check character codes for special characters
console.log("\n=== Character Codes ===");
console.log("Character code for:", "and".charCodeAt(0));
console.log("Character code for:", "".charCodeAt(0));
