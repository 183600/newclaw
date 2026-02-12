// Test with the exact text from the test file
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test case 1: Code blocks - exact text from test file
const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Test 1: Code blocks (actual function) ===");
console.log("Input:", JSON.stringify(text1));
const result1 = stripReasoningTagsFromText(text1);
console.log("Output:", JSON.stringify(result1));
console.log('Contains "This should be preserved":', result1.includes("This should be preserved"));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));

// Test case 2: Inline code - exact text from test file
const text2 = "Text with \`inline code\` and outside thinking.";

console.log("\n=== Test 2: Inline code (actual function) ===");
console.log("Input:", JSON.stringify(text2));
const result2 = stripReasoningTagsFromText(text2);
console.log("Output:", JSON.stringify(result2));
console.log('Contains "inline code":', result2.includes("inline code"));
console.log('Contains "thinking":', result2.includes("thinking"));

// Test case 3: Trim options
const text3 = "  Before thinking after  ";

console.log("\n=== Test 3: Trim options (actual function) ===");
console.log("Input:", JSON.stringify(text3));

const resultNone = stripReasoningTagsFromText(text3, { trim: "none" });
console.log("None result:", JSON.stringify(resultNone));

const resultStart = stripReasoningTagsFromText(text3, { trim: "start" });
console.log("Start result:", JSON.stringify(resultStart));

const resultBoth = stripReasoningTagsFromText(text3, { trim: "both" });
console.log("Both result:", JSON.stringify(resultBoth));
