import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with the actual content from the test file
const text1 = "Before This is <thinking>This is thinking</thinking> after.";
console.log("Test 1 with HTML tags:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Test with special characters
const text2 = "Before This is thinking\u0111 after.";
console.log("Test 2 with special chars:", JSON.stringify(stripReasoningTagsFromText(text2)));

// Check if the regex matches
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
console.log("Regex test on text1:", QUICK_TAG_RE.test(text1));
console.log("Regex test on text2:", QUICK_TAG_RE.test(text2));

// Find all matches in text2
const globalQuickTagRe = new RegExp(QUICK_TAG_RE.source, "gi");
const matches = [...text2.matchAll(globalQuickTagRe)];
console.log("Matches in text2:", matches);
