import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with actual test case
const test = "Before This is thinkingđ after.";
const result = stripReasoningTagsFromText(test);
console.log("Input:", JSON.stringify(test));
console.log("Output:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result === "Before  after.");

// Test with HTML tags
const test2 = "Before This is thinking</thinking> after.";
const result2 = stripReasoningTagsFromText(test2);
console.log("\nInput2:", JSON.stringify(test2));
console.log("Output2:", JSON.stringify(result2));
console.log("Expected2:", JSON.stringify("Before  after."));
console.log("Match2:", result2 === "Before  after.");
