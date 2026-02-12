import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the specific failing case
const text = "Text with `inline code ` and outside thinking.";
console.log("Input:", text);

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);
console.log('Contains "inline code ":', result.includes("inline code "));
console.log('Contains "thinking":', result.includes("thinking"));

// Check character by character
for (let i = 0; i < result.length; i++) {
  const char = result.charAt(i);
  const code = result.charCodeAt(i);
  if (char === "`") {
    console.log(`Backtick at position ${i}`);
  }
}
