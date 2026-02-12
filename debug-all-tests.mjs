// Debug all test cases
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Test 1: Simple thinking tag ===");
const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", text1);
console.log("Output:", stripReasoningTagsFromText(text1));
console.log("Expected: Before  after.");

console.log("\n=== Test 2: Multiple thinking blocks ===");
const text2 = "Start First thought</thought> middle Second thought</thought> end.";
console.log("Input:", text2);
console.log("Output:", stripReasoningTagsFromText(text2));
console.log("Expected: Start  middle  end.");

console.log("\n=== Test 3: Code blocks ===");
const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved</thinking>
  return true;
}
\`\`\`
Outside This should be removed</thinking> code block.`;
console.log("Input:", text3);
console.log("Output:", stripReasoningTagsFromText(text3));
console.log("Expected to contain: This should be preserved</thinking>");
console.log("Expected NOT to contain: This should be removed</thinking>");

console.log("\n=== Test 4: Inline code ===");
const text4 = "Text with \`inline code</thinking>\` and outside thinking</thinking>.";
console.log("Input:", text4);
console.log("Output:", stripReasoningTagsFromText(text4));
console.log("Expected to contain: inline code</thinking>");
console.log("Expected NOT to contain: thinking</thinking>");

console.log("\n=== Test 5: Unclosed tag - preserve mode ===");
const text5 = "Before Unclosed thinking content";
console.log("Input:", text5);
console.log("Output:", stripReasoningTagsFromText(text5, { mode: "preserve" }));
console.log("Expected: Unclosed thinking content");

console.log("\n=== Test 6: Unclosed tag - strict mode ===");
const text6 = "Before Unclosed thinking content";
console.log("Input:", text6);
console.log("Output:", stripReasoningTagsFromText(text6, { mode: "strict" }));
console.log("Expected: Before ");

console.log("\n=== Test 7: Trim options ===");
const text7 = "  Before thinking</thinking> after  ";
console.log("Input:", text7);
console.log("Output (none):", stripReasoningTagsFromText(text7, { trim: "none" }));
console.log("Expected:   Before   after  ");
