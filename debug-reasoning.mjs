#!/usr/bin/env node

// Simple debug script for reasoning tags
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Testing code block preservation ===");

const testText = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Input:");
console.log(JSON.stringify(testText));
console.log("\nOutput:");
const result = stripReasoningTagsFromText(testText);
console.log(JSON.stringify(result));
console.log("\nContains preserved:", result.includes("This should be preservedđ"));
console.log("Contains removed:", result.includes("This should be removedđ"));

console.log("\n=== Testing inline code preservation ===");

const inlineTest = "Text with \`inline code đ\` and outside thinkingđ.";
console.log("Input:");
console.log(JSON.stringify(inlineTest));
console.log("\nOutput:");
const inlineResult = stripReasoningTagsFromText(inlineTest);
console.log(JSON.stringify(inlineResult));
console.log("\nContains inline code:", inlineResult.includes("inline code đ"));
console.log("Contains thinking:", inlineResult.includes("thinkingđ"));

console.log("\n=== Testing trim options ===");

const trimTest = "  Before thinkingđ after  ";
console.log("Input:");
console.log(JSON.stringify(trimTest));

const resultNone = stripReasoningTagsFromText(trimTest, { trim: "none" });
console.log("\nTrim none result:");
console.log(JSON.stringify(resultNone));

const resultStart = stripReasoningTagsFromText(trimTest, { trim: "start" });
console.log("\nTrim start result:");
console.log(JSON.stringify(resultStart));

const resultBoth = stripReasoningTagsFromText(trimTest, { trim: "both" });
console.log("\nTrim both result:");
console.log(JSON.stringify(resultBoth));
