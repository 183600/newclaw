// Test the stripReasoningTagsFromText function
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "Before This is thinkingđ after.";
console.log("Original:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
