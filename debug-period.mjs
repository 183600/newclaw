// Debug why period is removed
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text = "Before thinkingđ after.";
console.log("Input:", JSON.stringify(text));
console.log(
  "Char positions:",
  [...text].map((c, i) => `${i}:${JSON.stringify(c)}`),
);

// Check what matches
const WORD_WITH_CLOSE_TAG_RE =
  /\b(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const matches = [...text.matchAll(WORD_WITH_CLOSE_TAG_RE)];
console.log("\nWORD_WITH_CLOSE_TAG_RE matches:", matches);

const result = stripReasoningTagsFromText(text, { trim: "both" });
console.log("\nOutput:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
