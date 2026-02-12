import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the exact input from the test
const text = "Text with `inline code ` and outside thinking.";
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
  if (i > 30 && i < 50) {
    const display = code === 32 ? "SPACE" : char;
    console.log(`Position ${i}: "${display}" (${code})`);
  }
}

// Check the thinking part
const thinkingIndex = text.indexOf("thinking");
console.log("thinking at position:", thinkingIndex);
if (thinkingIndex !== -1) {
  const afterThinking = text.substring(thinkingIndex, thinkingIndex + 10);
  console.log("thinking + next char:", afterThinking);
  console.log(
    "Character codes:",
    Array.from(afterThinking).map((c) => c.charCodeAt(0)),
  );
}

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);
console.log("Output length:", result.length);

// Check for special characters in result
for (let i = 0; i < result.length; i++) {
  const char = result.charAt(i);
  const code = result.charCodeAt(i);
  if (code === 273) {
    // đ
    console.log(`Found đ in result at position ${i}: "${char}" (${code})`);
  }
}
