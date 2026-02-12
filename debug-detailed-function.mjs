import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Create a modified version of the function with debug logging
function debugStripReasoningTagsFromText(text, options) {
  console.log("=== Debug Function Start ===");
  console.log("Input:", text);
  console.log("Options:", options);

  // This is a simplified version to debug the specific issue
  const HTML_THINKING_TAG_RE =
    /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
  const match = text.match(HTML_THINKING_TAG_RE);
  console.log("HTML tag match:", match);

  if (match && !match[0].includes("</")) {
    console.log("This is an opening tag");
    const openIndex = text.indexOf(match[0]);
    console.log("Opening tag at position:", openIndex);
    console.log("Character before:", text.charAt(openIndex - 1));
    console.log("Is space before:", text.charAt(openIndex - 1) === " ");

    // In strict mode, we should remove from the tag to the end
    const result = text.slice(0, openIndex);
    console.log("Simple result (no space preservation):", result);

    // With space preservation
    const resultWithSpace =
      openIndex > 0 && text.charAt(openIndex - 1) === " "
        ? text.slice(0, openIndex) + " "
        : text.slice(0, openIndex);
    console.log("Result with space preservation:", resultWithSpace);

    return resultWithSpace;
  }

  return text;
}

// Test with debugging
const text = "Before <thinking>content after.";
console.log("Input:", text);

const result = debugStripReasoningTagsFromText(text, { mode: "strict" });
console.log("Debug output:", result);
console.log("Expected: Before ");

// Test the actual function
const actualResult = stripReasoningTagsFromText(text, { mode: "strict" });
console.log("Actual function output:", actualResult);
