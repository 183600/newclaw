import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the specific failing case
const text = "Before <thinking class='test'>content</thinking> after.";
console.log("Input:", text);
console.log("Input length:", text.length);

// Check character by character around the tags
const openTagIndex = text.indexOf("<thinking");
const closeTagIndex = text.indexOf("</thinking>");

console.log("<thinking> at position:", openTagIndex);
console.log("</thinking> at position:", closeTagIndex);
console.log("Character before <thinking>:", text.charAt(openTagIndex - 1));
console.log("Character after </thinking>:", text.charAt(closeTagIndex + 13)); // 13 = length of </thinking>

const result = stripReasoningTagsFromText(text);
console.log("Output:", result);
console.log("Output length:", result.length);
console.log("Expected: Before  after.");
console.log("Match:", result === "Before  after.");

// Check the spaces
for (let i = 0; i < result.length; i++) {
  const char = result.charAt(i);
  const code = result.charCodeAt(i);
  const display = code === 32 ? "SPACE" : char;
  console.log(`Position ${i}: "${display}" (${code})`);
}
