import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Test with actual special characters ===");

// Test 1: Code blocks preservation
const test1 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("\nTest 1 - Code blocks preservation:");
console.log("Input:");
console.log(JSON.stringify(test1));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test1)));

// Test 2: Inline code preservation
const test2 = "Text with \`inline codeđ\` and outside thinkingđ.";
console.log("\nTest 2 - Inline code preservation:");
console.log("Input:");
console.log(JSON.stringify(test2));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test2)));

// Test 3: Unclosed thinking tags - preserve mode
const test3 = "Before Đthinking Unclosed thinking content";
console.log("\nTest 3 - Unclosed thinking tags (preserve mode):");
console.log("Input:");
console.log(JSON.stringify(test3));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test3, { mode: "preserve" })));

// Test 4: Unclosed thinking tags - strict mode
const test4 = "Before Đthinking Unclosed thinking content";
console.log("\nTest 4 - Unclosed thinking tags (strict mode):");
console.log("Input:");
console.log(JSON.stringify(test4));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test4, { mode: "strict" })));

// Test 5: Trim options
const test5 = "  Before Đthinkingđ after  ";
console.log("\nTest 5 - Trim options:");
console.log("Input:");
console.log(JSON.stringify(test5));
console.log("Trim none:");
console.log(JSON.stringify(stripReasoningTagsFromText(test5, { trim: "none" })));
console.log("\nTrim start:");
console.log(JSON.stringify(stripReasoningTagsFromText(test5, { trim: "start" })));
console.log("\nTrim both:");
console.log(JSON.stringify(stripReasoningTagsFromText(test5, { trim: "both" })));

// Test 6: Multiple thinking blocks
const test6 = "Start First thoughtđ middle Second thoughtđ end.";
console.log("\nTest 6 - Multiple thinking blocks:");
console.log("Input:");
console.log(JSON.stringify(test6));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test6)));

// Test for pi-embedded-utils
console.log("\n=== Test for pi-embedded-utils ===");
const test7 = "StartĐfirst thoughtđMiddleĐsecond thoughtđEnd";
console.log("\nTest 7 - Nested or multiple thinking blocks:");
console.log("Input:");
console.log(JSON.stringify(test7));
console.log("\nOutput:");
console.log(JSON.stringify(stripReasoningTagsFromText(test7)));
