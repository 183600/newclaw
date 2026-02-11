import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with special characters
const text1 = "Before This is thinking\u0111 after.";
console.log("Test 1 input:", JSON.stringify(text1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Test the regex
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
console.log("Regex test on text1:", QUICK_TAG_RE.test(text1));

// Find all matches
const globalQuickTagRe = new RegExp(QUICK_TAG_RE.source, "gi");
const matches = [...text1.matchAll(globalQuickTagRe)];
console.log("Matches:", matches);

// Test with multiple blocks
const text2 = "Start First thought\u0111 middle Second thought\u0111 end.";
console.log("Test 2 input:", JSON.stringify(text2));
console.log("Test 2 output:", JSON.stringify(stripReasoningTagsFromText(text2)));

// Test with code blocks
const text3 = `
\`\`\`javascript
function test() {
  // This should be preserved\u0111
  return true;
}
\`\`\`
Outside This should be removed\u0111 code block.`;
console.log("Test 3 output:", JSON.stringify(stripReasoningTagsFromText(text3)));

// Test with inline code
const text4 = "Text with \`inline code\u0111\` and outside thinking\u0111.";
console.log("Test 4 output:", JSON.stringify(stripReasoningTagsFromText(text4)));

// Test unclosed in preserve mode
const text5 = "Before \u0110thinkingUnclosed thinking content";
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
const text6 = "  Before thinking\u0111 after  ";
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
