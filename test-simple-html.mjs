import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with actual test case (HTML tags)
const test = "Before This is thinking</thinking> after.";
const result = stripReasoningTagsFromText(test);
console.log("Input:", JSON.stringify(test));
console.log("Output:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result === "Before  after.");
