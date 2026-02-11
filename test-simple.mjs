import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with actual test case
const test = "Before This is thinkingđ after.";
const result = stripReasoningTagsFromText(test);
console.log("Input:", JSON.stringify(test));
console.log("Output:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result === "Before  after.");

// Check character codes
console.log("\nCharacter codes in input:");
for (let i = 0; i < test.length; i++) {
  const char = test[i];
  const code = char.charCodeAt(0);
  if (code > 127 || char === " ") {
    console.log(`Position ${i}: "${char}" (code: ${code})`);
  }
}
