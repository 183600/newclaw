import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test 6: remove unclosed thinking tags in strict mode
console.log("=== Test 6: remove unclosed thinking tags in strict mode ===");
const text6 = "Before <thinking>Unclosed thinking content";
console.log("Input:", JSON.stringify(text6));
const result6 = stripReasoningTagsFromText(text6, { mode: "strict" });
console.log("Expected:", JSON.stringify("Before "));
console.log("Actual:", JSON.stringify(result6));
console.log("Pass:", result6 === "Before ");
console.log("Length of expected:", "Before ".length);
console.log("Length of actual:", result6.length);
console.log("Expected chars:", Array.from("Before "));
console.log("Actual chars:", Array.from(result6));
console.log("");
