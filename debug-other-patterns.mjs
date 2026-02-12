// Debug other patterns that might be removing content
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", text1);

// Check all patterns
const WORD_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)\u0111/gi;
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const WORD_HTML_TAG_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const WORD_WITH_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const WORD_WITH_SHORT_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>)/gi;

console.log("\n=== WORD_CLOSE_RE ===");
const matches1 = [...text1.matchAll(WORD_CLOSE_RE)];
console.log("Matches:", matches1);

console.log("\n=== WORD_HTML_CLOSE_RE ===");
const matches2 = [...text1.matchAll(WORD_HTML_CLOSE_RE)];
console.log("Matches:", matches2);

console.log("\n=== WORD_HTML_TAG_RE ===");
const matches3 = [...text1.matchAll(WORD_HTML_TAG_RE)];
console.log("Matches:", matches3);

console.log("\n=== WORD_WITH_HTML_CLOSE_RE ===");
const matches4 = [...text1.matchAll(WORD_WITH_HTML_CLOSE_RE)];
console.log("Matches:", matches4);

console.log("\n=== WORD_WITH_SHORT_HTML_CLOSE_RE ===");
const matches5 = [...text1.matchAll(WORD_WITH_SHORT_HTML_CLOSE_RE)];
console.log("Matches:", matches5);

// Check the actual result
const result = stripReasoningTagsFromText(text1);
console.log("\nActual result:", result);
console.log("Expected: Before  after.");
