// Debug actual trim test input
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Actual test input from test file
const text = "  Before thinkingđ after  ";
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

// Check SPECIAL_CLOSE_RE
const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)đ/gi;
const specialMatches = [...text.matchAll(SPECIAL_CLOSE_RE)];
console.log("SPECIAL_CLOSE_RE matches:", specialMatches);

const result = stripReasoningTagsFromText(text, { trim: "both" });
console.log("\nOutput:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
