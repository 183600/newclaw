// Test the actual stripReasoningTagsFromText function with debugging
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "Before This is thinkingđ after.";
console.log("Original:", JSON.stringify(text));

// Monkey patch the function to add debugging
const originalFunction = stripReasoningTagsFromText;

function debugStripReasoningTagsFromText(text, options) {
  // Call the original function but add debugging
  const result = originalFunction(text, options);

  // Add debugging for the specific case
  if (text.includes("Before This is thinkingđ after.")) {
    console.log("Input:", JSON.stringify(text));
    console.log("Output:", JSON.stringify(result));
    console.log("Expected:", JSON.stringify("Before  after."));

    // Check if the output matches expected
    if (result === "Before  after.") {
      console.log("✅ Output matches expected");
    } else {
      console.log("❌ Output does not match expected");

      // Check character by character
      for (let i = 0; i < Math.max(result.length, "Before  after.".length); i++) {
        const resultChar = i < result.length ? result[i] : "(missing)";
        const expectedChar = i < "Before  after.".length ? "Before  after."[i] : "(missing)";

        if (resultChar !== expectedChar) {
          console.log(
            `Difference at position ${i}: got ${JSON.stringify(resultChar)}, expected ${JSON.stringify(expectedChar)}`,
          );
        }
      }
    }
  }

  return result;
}

debugStripReasoningTagsFromText(text);
