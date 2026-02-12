import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Use the exact test input with special characters
const text = "Text with `inline code ` and outside thinking.";
console.log("Input:", text);
console.log("Input length:", text.length);

// Check for special characters
for (let i = 0; i < text.length; i++) {
  const char = text.charAt(i);
  const code = text.charCodeAt(i);
  if (code === 273) {
    // đ
    console.log(`Found đ at position ${i}`);
  }
}

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);
console.log('Contains "inline code ":', result.includes("inline code "));
console.log('Contains "thinking":', result.includes("thinking"));
