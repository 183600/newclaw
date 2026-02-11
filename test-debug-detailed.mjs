import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Monkey-patch the function to add logging
const originalFunction = stripReasoningTagsFromText;

function debugStripReasoningTagsFromText(text, options) {
  console.log("\n=== DEBUG: stripReasoningTagsFromText called ===");
  console.log("Input:", JSON.stringify(text));
  console.log("Options:", options);

  if (!text) {
    console.log("Early return: text is falsy");
    return text;
  }

  const QUICK_TAG_RE =
    /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

  if (!QUICK_TAG_RE.test(text)) {
    console.log("Early return: no tags found");
    return text;
  }

  console.log("Tags found, processing...");
  const result = originalFunction(text, options);
  console.log("Result:", JSON.stringify(result));
  return result;
}

// Test with actual data
console.log("=== Test 1: Code blocks preservation ===");
const test1 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

debugStripReasoningTagsFromText(test1);

console.log("\n=== Test 2: Inline code preservation ===");
const test2 = "Text with \`inline codeđ\` and outside thinkingđ.";
debugStripReasoningTagsFromText(test2);

console.log("\n=== Test 3: Unclosed thinking tags - preserve mode ===");
const test3 = "Before Đthinking Unclosed thinking content";
debugStripReasoningTagsFromText(test3, { mode: "preserve" });

console.log("\n=== Test 4: Unclosed thinking tags - strict mode ===");
const test4 = "Before Đthinking Unclosed thinking content";
debugStripReasoningTagsFromText(test4, { mode: "strict" });

console.log("\n=== Test 5: Trim options ===");
const test5 = "  Before Đthinkingđ after  ";
debugStripReasoningTagsFromText(test5, { trim: "both" });

console.log("\n=== Test 6: Multiple thinking blocks ===");
const test6 = "Start First thoughtđ middle Second thoughtđ end.";
debugStripReasoningTagsFromText(test6);

console.log("\n=== Test 7: Nested or multiple thinking blocks ===");
const test7 = "StartĐfirst thoughtđMiddleĐsecond thoughtđEnd";
debugStripReasoningTagsFromText(test7);
