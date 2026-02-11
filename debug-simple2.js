import * as funcs from "./dist/image-LEsUtI5w.js";

// 使用 stripThinkingTagsFromText 函数
const stripThinkingTagsFromText = funcs.g;

console.log("=== Testing stripThinkingTagsFromText ===");

// Test with a simple case that should work
const test1 = "Hello world";
const result1 = stripThinkingTagsFromText(test1);
console.log("Test 1 (no tags):", JSON.stringify(test1), "=>", JSON.stringify(result1));

// Test with special character
const test2 = "Before thinkingđ after";
const result2 = stripThinkingTagsFromText(test2);
console.log("Test 2 (special char):", JSON.stringify(test2), "=>", JSON.stringify(result2));

// Test with HTML
const test3 = "Before<thinking>content</thinking>After";
const result3 = stripThinkingTagsFromText(test3);
console.log("Test 3 (HTML):", JSON.stringify(test3), "=>", JSON.stringify(result3));

// Test with simple word
const test4 = "thinking content";
const result4 = stripThinkingTagsFromText(test4);
console.log("Test 4 (simple word):", JSON.stringify(test4), "=>", JSON.stringify(result4));
