import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Create the exact input with special characters using hex codes
const text = "Text with `inline code \u0111` and outside thinking\u0111.";
console.log("Input:", text);
console.log("Input length:", text.length);

// Check for special characters
for (let i = 0; i < text.length; i++) {
  const char = text.charAt(i);
  const code = text.charCodeAt(i);
  if (code === 273) {
    // đ
    console.log(`Found đ at position ${i}: "${char}" (${code})`);
  }
}

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);
console.log("Output length:", result.length);

// Check the assertions
const containsInlineCode = result.includes("inline code ");
console.log('Contains "inline code ":', containsInlineCode);

const notContainsThinking = !result.includes("thinking");
console.log('Does not contain "thinking":', notContainsThinking);

// Check for special characters in result
for (let i = 0; i < result.length; i++) {
  const char = result.charAt(i);
  const code = result.charCodeAt(i);
  if (code === 273) {
    // đ
    console.log(`Found đ in result at position ${i}: "${char}" (${code})`);
  }
}
