// Debug inline code fix
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test inline code
const text = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Input:", JSON.stringify(text));

// Check what's in inline code
const inlineStart = text.indexOf("`");
const inlineEnd = text.indexOf("`", inlineStart + 1);
const inlineContent = text.slice(inlineStart + 1, inlineEnd);
console.log("\nInline code content:", JSON.stringify(inlineContent));

const result = stripReasoningTagsFromText(text);
console.log("\nOutput:", JSON.stringify(result));

// Extract inline code from result
const resultInlineStart = result.indexOf("`");
const resultInlineEnd = result.indexOf("`", resultInlineStart + 1);
if (resultInlineStart !== -1 && resultInlineEnd !== -1) {
  const resultInlineContent = result.slice(resultInlineStart + 1, resultInlineEnd);
  console.log("Result inline content:", JSON.stringify(resultInlineContent));
  console.log("Contains 'inline code':", resultInlineContent.includes("inline code"));
}
