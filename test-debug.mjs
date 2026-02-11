import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Add debug logging to understand what's happening
const test = "Before This is thinkingđ after.";
console.log("Input:", test);

// Check if QUICK_TAG_RE matches
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]/i;
console.log("QUICK_TAG_RE matches:", QUICK_TAG_RE.test(test));

// Check if the function returns early
const result = stripReasoningTagsFromText(test);
console.log("Output:", result);
console.log("Expected:", "Before  after.");
console.log("Match:", result === "Before  after.");

// Let's trace through the function
console.log("\nTracing through function:");
if (!test) {
  console.log("Early return: empty input");
} else if (!QUICK_TAG_RE.test(test)) {
  console.log("Early return: no tags found");
} else {
  console.log("Processing tags...");
}
