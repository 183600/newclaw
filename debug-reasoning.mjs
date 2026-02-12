// Debug script to test the regex patterns
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const testText = "Before This is thinking after.";
console.log("Input text:", testText);
console.log("Character codes:");
for (let i = 0; i < testText.length; i++) {
  const char = testText[i];
  const code = char.charCodeAt(0);
  if (code < 32 || code > 126) {
    console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
  }
}

const result = stripReasoningTagsFromText(testText);
console.log("Result:", result);
console.log("Expected:", "Before  after.");
