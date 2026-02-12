import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test with debugging
console.log("=== Debugging Function ===");
const text = "Before <thinking>content after.";
console.log("Input:", text);

// Let's add some debugging to understand what's happening
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
}

const result = stripReasoningTagsFromText(text, { mode: "strict" });
console.log("Output:", result);
