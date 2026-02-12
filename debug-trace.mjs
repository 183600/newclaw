import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Let's add some debugging to the function
console.log("=== Debugging Only Closing Tags ===");
const onlyClosingText = "Before content</thinking> after.";

// First, let's check if the regex matches
const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;
console.log("HTML_THINKING_TAG_RE matches:");
for (const match of onlyClosingText.matchAll(HTML_THINKING_TAG_RE)) {
  console.log(`  "${match[0]}" at position ${match.index}, isClose: ${match[1] === "/"}`);
}

// Now let's trace through the function step by step
const result = stripReasoningTagsFromText(onlyClosingText);
console.log("Final result:", result);
console.log("Expected: Before  after.");
