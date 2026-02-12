import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the exact case from the test
console.log("=== Test: Exact test case ===");
const text = "Text with `inline code`\u0111 and outside thinking\u0111.";
const result = stripReasoningTagsFromText(text);
console.log("Input:", JSON.stringify(text));
console.log("Output:", JSON.stringify(result));
console.log("Contains inline code\u0111:", result.includes("inline code\u0111"));
console.log("Contains thinking\u0111:", result.includes("thinking\u0111"));

// Let's also check what the regex finds
const inlineRe = /`([^`]+)`/g;
for (const match of text.matchAll(inlineRe)) {
  console.log("Inline code match:", {
    full: match[0],
    group: match[1],
    index: match.index,
    length: match[0].length,
  });
}
