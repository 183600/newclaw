// Debug removal ranges
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", text1);
console.log("Input length:", text1.length);
console.log(
  "Char positions:",
  [...text1].map((c, i) => `${i}:${c}`),
);

// Manually check what should be removed
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const matches = [...text1.matchAll(WORD_HTML_CLOSE_RE)];
console.log("\nMatches:", matches);

for (const match of matches) {
  console.log(`Match "${match[0]}" from ${match.index} to ${match.index + match[0].length}`);
}

// Check the actual result
const result = stripReasoningTagsFromText(text1);
console.log("\nActual result:", result);
console.log("Expected result: Before  after.");
console.log("Match:", result === "Before  after.");

// Check what's being removed
console.log("\n=== Checking what's removed ===");
const beforeText = text1.slice(0, 7); // "Before "
const afterText = text1.slice(34); // After "This is thinking</thinking>" (ends at position 34)
console.log("Before part:", beforeText);
console.log("After part:", afterText);
console.log("Combined:", beforeText + afterText);
