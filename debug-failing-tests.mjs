// Debug failing tests
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test inline code
const textInline = "Text with `inline codeđ` and outside thinkingđ.";
console.log("=== Inline Code Test ===");
console.log("Input:", JSON.stringify(textInline));
const resultInline = stripReasoningTagsFromText(textInline);
console.log("Output:", JSON.stringify(resultInline));
console.log("Contains 'inline codeđ':", resultInline.includes("inline codeđ"));
console.log("Contains 'thinkingđ':", resultInline.includes("thinkingđ"));

// Test trim both
const textTrim = "  Before thinkingđ after  ";
console.log("\n=== Trim Both Test ===");
console.log("Input:", JSON.stringify(textTrim));
const resultTrimBoth = stripReasoningTagsFromText(textTrim, { trim: "both" });
console.log("Output:", JSON.stringify(resultTrimBoth));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", resultTrimBoth === "Before  after.");

// Test strict mode
const textStrict = "Before Unclosed thinking content";
console.log("\n=== Strict Mode Test ===");
console.log("Input:", JSON.stringify(textStrict));
const resultStrict = stripReasoningTagsFromText(textStrict, { mode: "strict" });
console.log("Output:", JSON.stringify(resultStrict));
console.log("Expected:", JSON.stringify("Before "));
console.log("Match:", resultStrict === "Before ");
