import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test case 2: malformed HTML entities
const testCase2 = "&#x110;thinking content thinking&#x111; and &#x110;thinking";
console.log("Test case 2:");
console.log("Input:", JSON.stringify(testCase2));
const result2 = stripReasoningTagsFromText(testCase2);
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", JSON.stringify(" and "));
console.log("Match:", result2 === " and ");

// Check if there are any hidden characters
console.log("\nChecking for hidden characters:");
for (let i = 0; i < testCase2.length; i++) {
  console.log(`Position ${i}: char="${testCase2[i]}", code=${testCase2.charCodeAt(i)}`);
}
