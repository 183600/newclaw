import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test case 2: malformed HTML entities
const testCase2 = "&#x110;thinking content thinking&#x111; and &#x110;thinking";
console.log("Test case 2:");
console.log("Input:", JSON.stringify(testCase2));
console.log("Input length:", testCase2.length);
const result2 = stripReasoningTagsFromText(testCase2);
console.log("Output:", JSON.stringify(result2));
console.log("Output length:", result2.length);
console.log("Expected:", JSON.stringify(" and "));
console.log("Expected length:", " and ".length);

// Check character by character
console.log("\nCharacter comparison:");
for (let i = 0; i < Math.max(result2.length, " and ".length); i++) {
  const resultChar = i < result2.length ? result2.charCodeAt(i) : "N/A";
  const expectedChar = i < " and ".length ? " and ".charCodeAt(i) : "N/A";
  console.log(
    `Position ${i}: result=${resultChar} (${i < result2.length ? result2[i] : "N/A"}), expected=${expectedChar} (${i < " and ".length ? " and "[i] : "N/A"})`,
  );
}
