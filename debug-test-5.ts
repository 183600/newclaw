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

// Check the actual test expectations
console.log("\n=== Test Expectations ===");
console.log(
  'Test 1 expects "This should be preserved" to be present:',
  result1.includes("This should be preserved"),
);
console.log(
  'Test 1 expects "This should be removed" to be absent:',
  !result1.includes("This should be removed"),
);
console.log('Test 2 expects "inline code" to be present:', result2.includes("inline code"));
console.log('Test 2 expects "thinking" to be absent:', !result2.includes("thinking"));
