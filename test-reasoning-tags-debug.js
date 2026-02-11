import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Debug regex patterns
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;

// Test special characters
console.log("Special character đ:", "\u0111");
console.log("Special character Đ:", "\u0110");

// Test case 1: simple thinking tags
const text1 = "Before This is thinking</think> after.";
console.log("Test 1 regex test:", QUICK_TAG_RE.test(text1));
console.log("Test 1:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Test case 2: multiple thinking blocks
const text2 = "Start First thought</think> middle Second thought</think> end.";
console.log("Test 2 regex test:", QUICK_TAG_RE.test(text2));
console.log("Test 2:", JSON.stringify(stripReasoningTagsFromText(text2)));

// Test case 3: preserve mode
const text3 = "Before Unclosed thinking content";
console.log("Test 3 regex test:", QUICK_TAG_RE.test(text3));
console.log(
  "Test 3 (preserve):",
  JSON.stringify(stripReasoningTagsFromText(text3, { mode: "preserve" })),
);

// Test case 4: strict mode
console.log(
  "Test 4 (strict):",
  JSON.stringify(stripReasoningTagsFromText(text3, { mode: "strict" })),
);

// Test case 5: trim options
const text5 = "  Before thinking</think> after  ";
console.log("Test 5 regex test:", QUICK_TAG_RE.test(text5));
console.log("Test 5 (none):", JSON.stringify(stripReasoningTagsFromText(text5, { trim: "none" })));

// Test with HTML tags
const text6 = "Before <thinking>This is thinking</thinking> after.";
console.log("Test 6 regex test:", QUICK_TAG_RE.test(text6));
console.log("Test 6:", JSON.stringify(stripReasoningTagsFromText(text6)));
