import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Testing code blocks ===");
const codeBlockTest = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Input:");
console.log(JSON.stringify(codeBlockTest));
console.log("\nOutput:");
const result1 = stripReasoningTagsFromText(codeBlockTest);
console.log(JSON.stringify(result1));
console.log(
  "\nExpected: Contains 'This should be preserved', does not contain 'This should be removed'",
);
console.log("Contains preserved:", result1.includes("This should be preserved"));
console.log("Contains removed:", result1.includes("This should be removed"));

console.log("\n=== Testing inline code ===");
// Using hex codes to avoid issues
const inlineCodeTest =
  "Text with `inline code" + "\u0111" + "` and outside thinking" + "\u0111" + ".";
console.log("Input:");
console.log(JSON.stringify(inlineCodeTest));
console.log("\nOutput:");
const result2 = stripReasoningTagsFromText(inlineCodeTest);
console.log(JSON.stringify(result2));
console.log("\nExpected: Contains 'inline code', does not contain 'thinking'");
console.log("Contains inline:", result2.includes("inline code" + "\u0111"));
console.log("Contains thinking:", result2.includes("thinking"));

console.log("\n=== Testing trim options ===");
const trimTest = "  Before thinking" + "\u0111" + " after  ";
console.log("Input:", JSON.stringify(trimTest));
console.log("\nNone mode:", JSON.stringify(stripReasoningTagsFromText(trimTest, { trim: "none" })));
console.log("Expected:", JSON.stringify("  Before  after  "));
console.log("Start mode:", JSON.stringify(stripReasoningTagsFromText(trimTest, { trim: "start" })));
console.log("Expected:", JSON.stringify("Before  after  "));
console.log("Both mode:", JSON.stringify(stripReasoningTagsFromText(trimTest, { trim: "both" })));
console.log("Expected:", JSON.stringify("Before  after."));
