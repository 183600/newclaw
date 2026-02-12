import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Test with exact characters from the test file
const text = "Text with `inline code` and outside thinking.";
console.log("Input:", JSON.stringify(text));
console.log("Char codes for special chars:");
console.log("Code for:", "".charCodeAt(0));
console.log("Code for:", "".charCodeAt(0));

const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));
console.log('Contains "inline code":', result.includes("inline code"));
console.log('Contains "thinking":', result.includes("thinking"));

// Check actual output
console.log("\nActual output analysis:");
for (let i = 0; i < result.length; i++) {
  const char = result[i];
  const code = char.charCodeAt(0);
  if (code === 273 || code === 272) {
    console.log(`Position ${i}: "${char}" (code: ${code})`);
  }
}
