import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the actual function
console.log("=== Testing Actual Function ===");
const text = "Before <thinking>content after.";
console.log("Input:", text);

const result = stripReasoningTagsFromText(text, { mode: "strict" });
console.log("Output:", result);
console.log("Output length:", result.length);
console.log("Last character:", result.charAt(result.length - 1));
console.log("Last character code:", result.charCodeAt(result.length - 1));
console.log("Expected: Before ");
console.log("Match:", result === "Before ");
