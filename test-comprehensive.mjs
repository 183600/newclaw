// Let's create a comprehensive test to understand what the function should do
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// The issue is that the function needs to handle arbitrary words with special characters
// Currently it only handles specific words like "thinking", "thought", "antthinking"

console.log("=== Current behavior ===\n");

// Test with arbitrary word + special character
const test1 = "This should be removed";
const test1WithSpecial = test1 + "";
console.log("Test 1:", JSON.stringify(test1WithSpecial));
const result1 = stripReasoningTagsFromText(test1WithSpecial);
console.log("Result:", JSON.stringify(result1));
console.log('Expected: "This should be " (word removed with special char)');
console.log("");

// Test with inline code
const test2 = "Text with `inline code` and outside thinking";
const test2WithSpecial = test2
  .replace("inline code", "inline code")
  .replace("thinking", "thinking");
console.log("Test 2:", JSON.stringify(test2WithSpecial));
const result2 = stripReasoningTagsFromText(test2WithSpecial);
console.log("Result:", JSON.stringify(result2));
console.log('Expected: "Text with `inline code` and outside " (words with special chars removed)');
console.log("");

// Test with unclosed thinking tag
const test3 = "Before Unclosed thinking content";
const test3WithSpecial = test3.replace("thinking", "Đthinking");
console.log("Test 3:", JSON.stringify(test3WithSpecial));
const result3 = stripReasoningTagsFromText(test3WithSpecial, { mode: "preserve" });
console.log("Result (preserve):", JSON.stringify(result3));
console.log('Expected: "Unclosed thinking content" (content after unclosed tag)');
console.log("");

const result4 = stripReasoningTagsFromText(test3WithSpecial, { mode: "strict" });
console.log("Result (strict):", JSON.stringify(result4));
console.log('Expected: "Before " (tag and content removed)');
console.log("");

// Test with trim
const test5 = "  Before thinking after  ";
const test5WithSpecial = test5.replace("thinking", "Đthinkingđ");
console.log("Test 5:", JSON.stringify(test5WithSpecial));
const result5 = stripReasoningTagsFromText(test5WithSpecial, { trim: "none" });
console.log("Result (none):", JSON.stringify(result5));
console.log('Expected: "  Before  after  " (special chars removed)');
console.log("");

console.log("=== Analysis ===");
console.log("The function needs to:");
console.log("1. Remove arbitrary words followed by special characters");
console.log("2. For unclosed tags (Đword), extract the content after the tag");
console.log("3. For paired tags (wordđ), remove the entire word");
console.log("4. Preserve words inside code blocks");
