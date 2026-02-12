import { stripReasoningTagsFromText } from "./dist/shared-D2jHXEDM.js";

console.log("=== Testing stripReasoningTagsFromText ===\n");

// Test 1: should remove simple thinking tags
console.log("Test 1: should remove simple thinking tags");
const text1 = "Before This is thinking after.";
const result1 = stripReasoningTagsFromText(text1);
console.log("Input:", JSON.stringify(text1));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Actual:", JSON.stringify(result1));
console.log("Pass:", result1 === "Before  after.");
console.log();

// Test 2: should handle multiple thinking blocks
console.log("Test 2: should handle multiple thinking blocks");
const text2 = "Start First thought middle Second thought end.";
const result2 = stripReasoningTagsFromText(text2);
console.log("Input:", JSON.stringify(text2));
console.log("Expected:", JSON.stringify("Start  middle  end."));
console.log("Actual:", JSON.stringify(result2));
console.log("Pass:", result2 === "Start  middle  end.");
console.log();

// Test 3: should preserve content within code blocks
console.log("Test 3: should preserve content within code blocks");
const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

const result3 = stripReasoningTagsFromText(text3);
console.log("Input:", JSON.stringify(text3));
console.log("Contains preserved:", result3.includes("This should be preserved"));
console.log("Contains removed:", result3.includes("This should be removed"));
console.log();

// Test 4: should handle inline code preservation
console.log("Test 4: should handle inline code preservation");
const text4 = "Text with \`inline code\` and outside thinking.";
const result4 = stripReasoningTagsFromText(text4);
console.log("Input:", JSON.stringify(text4));
console.log("Contains inline:", result4.includes("inline code"));
console.log("Contains thinking:", result4.includes("thinking"));
console.log();

// Test 5: should preserve unclosed thinking tags in preserve mode
console.log("Test 5: should preserve unclosed thinking tags in preserve mode");
const text5 = "Before Unclosed thinking content";
const result5 = stripReasoningTagsFromText(text5, { mode: "preserve" });
console.log("Input:", JSON.stringify(text5));
console.log("Expected:", JSON.stringify("Unclosed thinking content"));
console.log("Actual:", JSON.stringify(result5));
console.log("Pass:", result5 === "Unclosed thinking content");
console.log();

// Test 6: should remove unclosed thinking tags in strict mode
console.log("Test 6: should remove unclosed thinking tags in strict mode");
const text6 = "Before Unclosed thinking content";
const result6 = stripReasoningTagsFromText(text6, { mode: "strict" });
console.log("Input:", JSON.stringify(text6));
console.log("Expected:", JSON.stringify("Before "));
console.log("Actual:", JSON.stringify(result6));
console.log("Pass:", result6 === "Before ");
console.log();

// Test 7: should respect trim options
console.log("Test 7: should respect trim options");
const text7 = "  Before thinking after  ";

const resultNone = stripReasoningTagsFromText(text7, { trim: "none" });
console.log("Input:", JSON.stringify(text7));
console.log("Expected (none):", JSON.stringify("  Before  after  "));
console.log("Actual (none):", JSON.stringify(resultNone));
console.log("Pass (none):", resultNone === "  Before  after  ");

const resultBoth = stripReasoningTagsFromText(text7, { trim: "both" });
console.log("Expected (both):", JSON.stringify("Before  after."));
console.log("Actual (both):", JSON.stringify(resultBoth));
console.log("Pass (both):", resultBoth === "Before  after.");
console.log();
