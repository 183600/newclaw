// Debug script to test the stripReasoningTagsFromText function
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Test 1: Simple thinking tag ===");
const text1 = "Before This is thinking&#x111; after.";
console.log("Input:", text1);
const result1 = stripReasoningTagsFromText(text1);
console.log("Output:", result1);
console.log("Expected: Before  after.");
console.log("Match:", result1 === "Before  after.");

console.log("\n=== Test 2: Multiple thinking blocks ===");
const text2 = "Start First thought&#x111; middle Second thought&#x111; end.";
console.log("Input:", text2);
const result2 = stripReasoningTagsFromText(text2);
console.log("Output:", result2);
console.log("Expected: Start  middle  end.");
console.log("Match:", result2 === "Start  middle  end.");

console.log("\n=== Test 3: Code blocks ===");
const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved&#x111;
  return true;
}
\`\`\`
Outside This should be removed&#x111; code block.`;
console.log("Input:", text3);
const result3 = stripReasoningTagsFromText(text3);
console.log("Output:", result3);
console.log("Contains preserved:", result3.includes("This should be preserved&#x111;"));
console.log("Contains removed:", result3.includes("This should be removed&#x111;"));

console.log("\n=== Test 4: Inline code ===");
const text4 = "Text with \`inline code&#x111;\` and outside thinking&#x111;.";
console.log("Input:", text4);
const result4 = stripReasoningTagsFromText(text4);
console.log("Output:", result4);
console.log("Contains inline:", result4.includes("inline code&#x111;"));
console.log("Contains thinking:", result4.includes("thinking&#x111;"));

console.log("\n=== Test 5: Unclosed tag - preserve mode ===");
const text5 = "Before &#x110;thinking Unclosed thinking content";
console.log("Input:", text5);
const result5 = stripReasoningTagsFromText(text5, { mode: "preserve" });
console.log("Output:", result5);
console.log("Expected: Unclosed thinking content");
console.log("Match:", result5 === "Unclosed thinking content");

console.log("\n=== Test 6: Unclosed tag - strict mode ===");
const text6 = "Before &#x110;thinking Unclosed thinking content";
console.log("Input:", text6);
const result6 = stripReasoningTagsFromText(text6, { mode: "strict" });
console.log("Output:", result6);
console.log("Expected: Before ");
console.log("Match:", result6 === "Before ");

console.log("\n=== Test 7: Trim options ===");
const text7 = "  Before thinking&#x111; after  ";
console.log("Input:", text7);
const result7a = stripReasoningTagsFromText(text7, { trim: "none" });
console.log("Output (none):", result7a);
console.log("Expected:   Before   after  ");
console.log("Match:", result7a === "  Before  after  ");
