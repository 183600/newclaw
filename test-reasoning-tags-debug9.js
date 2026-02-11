import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with the actual content from the test file
const text1 = "Before This is <thinking>This is thinking</thinking> after.";
console.log("Test 1 input:", JSON.stringify(text1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Test with multiple blocks
const text2 =
  "Start First <thinking>First thought</thinking> middle Second <thinking>Second thought</thinking> end.";
console.log("Test 2 input:", JSON.stringify(text2));
console.log("Test 2 output:", JSON.stringify(stripReasoningTagsFromText(text2)));

// Test with code blocks
const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved<thinking>This is thinking</thinking>
  return true;
}
\`\`\`
Outside This should be removed<thinking>thinking</thinking> code block.`;
console.log("Test 3 output:", JSON.stringify(stripReasoningTagsFromText(text3)));

// Test with inline code
const text4 =
  "Text with \`inline code<thinking>thinking</thinking>\` and outside thinking<thinking>thinking</thinking>.";
console.log("Test 4 output:", JSON.stringify(stripReasoningTagsFromText(text4)));

// Test unclosed in preserve mode
const text5 = "Before <thinking>Unclosed thinking content";
console.log(
  "Test 5 preserve output:",
  JSON.stringify(stripReasoningTagsFromText(text5, { mode: "preserve" })),
);

// Test unclosed in strict mode
console.log(
  "Test 5 strict output:",
  JSON.stringify(stripReasoningTagsFromText(text5, { mode: "strict" })),
);

// Test trim options
const text6 = "  Before <thinking>thinking</thinking> after  ";
console.log(
  "Test 6 none output:",
  JSON.stringify(stripReasoningTagsFromText(text6, { trim: "none" })),
);
console.log(
  "Test 6 start output:",
  JSON.stringify(stripReasoningTagsFromText(text6, { trim: "start" })),
);
console.log(
  "Test 6 both output:",
  JSON.stringify(stripReasoningTagsFromText(text6, { trim: "both" })),
);
