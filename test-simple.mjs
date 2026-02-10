import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test 1: think tags
const test1 = "This is think content
This is the actual response.";
console.log("Test 1 input:", JSON.stringify(test1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(test1)));
console.log("Expected:", JSON.stringify("This is the actual response."));