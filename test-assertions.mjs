import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the exact input from the test
const text = "Text with `inline code ` and outside thinking.";
console.log("Input:", text);

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);

// Check the assertions
const containsInlineCode = result.includes("inline code ");
console.log('Contains "inline code ":', containsInlineCode);
console.log("Expected: true");

const notContainsThinking = !result.includes("thinking");
console.log('Does not contain "thinking":', notContainsThinking);
console.log("Expected: true");

// Check character by character around inline code
const inlineCodeIndex = result.indexOf("inline code ");
if (inlineCodeIndex !== -1) {
  console.log("inline code  at position:", inlineCodeIndex);
  for (let i = inlineCodeIndex - 5; i <= inlineCodeIndex + 15; i++) {
    if (i >= 0 && i < result.length) {
      const char = result.charAt(i);
      const code = result.charCodeAt(i);
      const display = code === 32 ? "SPACE" : char;
      console.log(`Position ${i}: "${display}" (${code})`);
    }
  }
}
