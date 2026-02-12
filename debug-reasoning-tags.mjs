import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("=== Testing inline code preservation ===");
const inlineText = "Text with `inline code\u0111` and outside thinking\u0111.";
console.log("Input:", JSON.stringify(inlineText));
const inlineResult = stripReasoningTagsFromText(inlineText);
console.log("Output:", JSON.stringify(inlineResult));
console.log("Expected to contain:", JSON.stringify("inline code\u0111"));
console.log("Contains expected:", inlineResult.includes("inline code\u0111"));
console.log();

console.log("=== Testing strict mode ===");
const strictText = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(strictText));
const strictResult = stripReasoningTagsFromText(strictText, { mode: "strict" });
console.log("Output:", JSON.stringify(strictResult));
console.log("Expected:", JSON.stringify("Before "));
console.log();

console.log("=== Testing preserve mode ===");
const preserveText = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(preserveText));
const preserveResult = stripReasoningTagsFromText(preserveText, { mode: "preserve" });
console.log("Output:", JSON.stringify(preserveResult));
console.log("Expected:", JSON.stringify("Unclosed thinking content"));
console.log();
