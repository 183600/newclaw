import { stripReasoningTagsFromText } from "./dist/shared/text/reasoning-tags.js";

console.log("Testing stripReasoningTagsFromText...");

// Test 1: Simple thinking tags
const test1 = "Before <thinking>This is thinking</thinking> after.";
const result1 = stripReasoningTagsFromText(test1);
console.log("Test 1 - Simple thinking tags:");
console.log("Input: ", test1);
console.log("Output:", result1);
console.log('Expected: "Before  after."');
console.log("Match:", result1 === "Before  after.");
console.log("");

// Test 2: Multiple thinking blocks
const test2 =
  "Start <thinking>First thought</thinking> middle <thinking>Second thought</thinking> end.";
const result2 = stripReasoningTagsFromText(test2);
console.log("Test 2 - Multiple thinking blocks:");
console.log("Input: ", test2);
console.log("Output:", result2);
console.log('Expected: "Start  middle  end."');
console.log("Match:", result2 === "Start  middle  end.");
console.log("");

// Test 3: Preserve content within code blocks
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved<thinking>
  return true;
}
\`\`\`
Outside <thinking>This should be removed</thinking> code block.`;

const result3 = stripReasoningTagsFromText(test3);
console.log("Test 3 - Preserve content within code blocks:");
console.log("Input: ", test3);
console.log("Output:", result3);
console.log(
  'Contains "This should be preserved<thinking>":',
  result3.includes("This should be preserved<thinking>"),
);
console.log(
  'Contains "This should be removed<thinking>":',
  result3.includes("This should be removed<thinking>"),
);
console.log("");

// Test 4: Inline code preservation
const test4 = "Text with \`inline code<thinking>\` and outside thinking<thinking>.";
const result4 = stripReasoningTagsFromText(test4);
console.log("Test 4 - Inline code preservation:");
console.log("Input: ", test4);
console.log("Output:", result4);
console.log('Contains "inline code<thinking>":', result4.includes("inline code<thinking>"));
console.log('Contains "thinking<thinking>":', result4.includes("thinking<thinking>"));
console.log("");

// Test 5: Preserve unclosed thinking tags in preserve mode
const test5 = "Before <thinking>Unclosed thinking content";
const result5 = stripReasoningTagsFromText(test5, { mode: "preserve" });
console.log("Test 5 - Preserve unclosed thinking tags in preserve mode:");
console.log("Input: ", test5);
console.log("Output:", result5);
console.log("Expected: Unclosed thinking content");
console.log("Match:", result5 === "Unclosed thinking content");
console.log("");

// Test 6: Remove unclosed thinking tags in strict mode
const test6 = "Before <thinking>Unclosed thinking content";
const result6 = stripReasoningTagsFromText(test6, { mode: "strict" });
console.log("Test 6 - Remove unclosed thinking tags in strict mode:");
console.log("Input: ", test6);
console.log("Output:", result6);
console.log("Expected: Before ");
console.log("Match:", result6 === "Before ");
console.log("");

// Test 7: Trim options
const test7 = "  Before <thinking>thinking</thinking> after  ";
const resultNone = stripReasoningTagsFromText(test7, { trim: "none" });
const resultStart = stripReasoningTagsFromText(test7, { trim: "start" });
const resultBoth = stripReasoningTagsFromText(test7, { trim: "both" });
console.log("Test 7 - Trim options:");
console.log("Input: ", test7);
console.log("Result (none):", resultNone);
console.log("Expected (none):  2 spaces Before  after  2 spaces");
console.log("Match (none):", resultNone === "  Before  after  ");
console.log("Result (start):", resultStart);
console.log("Expected (start): Before  after  2 spaces");
console.log("Match (start):", resultStart === "Before  after  ");
console.log("Result (both):", resultBoth);
console.log("Expected (both): Before  after.");
console.log("Match (both):", resultBoth === "Before  after.");
console.log("");
