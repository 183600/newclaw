import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test 7: trim options - exact reproduction
console.log("=== Test 7: exact reproduction ===");

// Reproduce the exact test case from the test file
const text = "  Before <thinking>thinking\nafter  ";

console.log("Input:", JSON.stringify(text));
console.log("Input chars:", Array.from(text));

const resultNone = stripReasoningTagsFromText(text, { trim: "none" });
console.log("Result (none):", JSON.stringify(resultNone));
console.log("Result (none) chars:", Array.from(resultNone));
console.log("Expected (none):", JSON.stringify("  Before  after  "));

const resultStart = stripReasoningTagsFromText(text, { trim: "start" });
console.log("Result (start):", JSON.stringify(resultStart));
console.log("Expected (start):", JSON.stringify("Before  after  "));

const resultBoth = stripReasoningTagsFromText(text, { trim: "both" });
console.log("Result (both):", JSON.stringify(resultBoth));
console.log("Expected (both):", JSON.stringify("Before  after."));
