// Debug inline code expectation
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test what the test actually expects
const text = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Input:", JSON.stringify(text));

const result = stripReasoningTagsFromText(text);
console.log("\nActual output:", JSON.stringify(result));
console.log("Contains 'inline code':", result.includes("inline code"));
console.log("Contains 'inline code</t>':", result.includes("inline code</t>"));
console.log("Contains '`inline code`':", result.includes("`inline code`"));

// Maybe the expectation is to remove tags within inline code?
// Let's see what the test description says
console.log("\nTest description: 'should handle inline code preservation'");
console.log("This could mean:");
console.log("1. Preserve the entire inline code block (including tags)");
console.log("2. Preserve the inline code but remove tags within it");
console.log("3. Something else");

// Based on the test expecting 'inline code' (no backticks, no tag),
// it seems option 2 is expected: preserve content but remove tags
