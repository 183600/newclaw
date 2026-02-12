// Test with HTML entities like in the actual test file
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test case 1: Code blocks with HTML entities
const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved&#x111;
  return true;
}
\`\`\`
Outside This should be removed&#x111; code block.`;

console.log("=== Test 1: Code blocks with HTML entities ===");
console.log("Input:", JSON.stringify(text1));
const result1 = stripReasoningTagsFromText(text1);
console.log("Output:", JSON.stringify(result1));
console.log('Contains "This should be preserved":', result1.includes("This should be preserved"));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));

// Test case 2: Simple thinking tag
const text2 = "Before <thinking>after";

console.log("\n=== Test 2: Simple thinking tag ===");
console.log("Input:", JSON.stringify(text2));
const result2 = stripReasoningTagsFromText(text2);
console.log("Output:", JSON.stringify(result2));

// Test case 3: Trim options with thinking tag
const text3 = "  Before <thinking>after  ";

console.log("\n=== Test 3: Trim options with thinking tag ===");
console.log("Input:", JSON.stringify(text3));

const resultNone = stripReasoningTagsFromText(text3, { trim: "none" });
console.log("None result:", JSON.stringify(resultNone));

const resultStart = stripReasoningTagsFromText(text3, { trim: "start" });
console.log("Start result:", JSON.stringify(resultStart));

const resultBoth = stripReasoningTagsFromText(text3, { trim: "both" });
console.log("Both result:", JSON.stringify(resultBoth));
