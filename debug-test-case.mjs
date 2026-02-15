import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test case 1: mixed HTML entities and special characters
const testCase1 = "&#x110;thinking content thinking&#x111; and Đmore thinkingđ";
console.log("Test case 1:");
console.log("Input:", JSON.stringify(testCase1));
const result1 = stripReasoningTagsFromText(testCase1);
console.log("Output:", JSON.stringify(result1));
console.log("Expected:", JSON.stringify(" and "));
console.log("");

// Test case 2: malformed HTML entities
const testCase2 = "&#x110;thinking content&#x111; and &#x110;thinking";
console.log("Test case 2:");
console.log("Input:", JSON.stringify(testCase2));
const result2 = stripReasoningTagsFromText(testCase2);
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", JSON.stringify(" and "));
console.log("");

// Test case 4: overlapping special character patterns
const testCase4 = "Đthinkingthinkingđ content";
console.log("Test case 4:");
console.log("Input:", JSON.stringify(testCase4));
const result4 = stripReasoningTagsFromText(testCase4);
console.log("Output:", JSON.stringify(result4));
console.log("Expected:", JSON.stringify(" content"));
console.log("");
