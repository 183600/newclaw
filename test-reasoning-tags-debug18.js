import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with special characters (from the actual test cases)
const text1 = "Before This is thinkingđ after.";
console.log("Test 1 input:", JSON.stringify(text1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(text1)));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("");

// Test with multiple blocks
const text2 = "Start First thoughtđ middle Second thoughtđ end.";
console.log("Test 2 input:", JSON.stringify(text2));
console.log("Test 2 output:", JSON.stringify(stripReasoningTagsFromText(text2)));
console.log("Expected:", JSON.stringify("Start  middle  end."));
console.log("");

// Test with code blocks
const text3 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;
console.log("Test 3 input:", JSON.stringify(text3));
console.log("Test 3 output:", JSON.stringify(stripReasoningTagsFromText(text3)));
console.log("");

// Test with inline code
const text4 = "Text with \`inline codeđ\` and outside thinkingđ.";
console.log("Test 4 input:", JSON.stringify(text4));
console.log("Test 4 output:", JSON.stringify(stripReasoningTagsFromText(text4)));
console.log("");

// Test unclosed in preserve mode
const text5 = "Before ĐthinkingUnclosed thinking content";
console.log("Test 5 preserve input:", JSON.stringify(text5));
console.log(
  "Test 5 preserve output:",
  JSON.stringify(stripReasoningTagsFromText(text5, { mode: "preserve" })),
);
console.log("Expected:", JSON.stringify("Unclosed thinking content"));
console.log("");

// Test unclosed in strict mode
console.log(
  "Test 5 strict output:",
  JSON.stringify(stripReasoningTagsFromText(text5, { mode: "strict" })),
);
console.log("Expected:", JSON.stringify("Before "));
console.log("");

// Test trim options
const text6 = "  Before thinkingđ after  ";
console.log("Test 6 input:", JSON.stringify(text6));
console.log(
  "Test 6 none output:",
  JSON.stringify(stripReasoningTagsFromText(text6, { trim: "none" })),
);
console.log("Expected:", JSON.stringify("  Before  after  "));
console.log("");

// Check regex
const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)/i;
console.log("Regex test on text1:", QUICK_TAG_RE.test(text1));

// Find all matches
const globalQuickTagRe = new RegExp(QUICK_TAG_RE.source, "gi");
const matches = [...text1.matchAll(globalQuickTagRe)];
console.log("Matches in text1:", matches);
