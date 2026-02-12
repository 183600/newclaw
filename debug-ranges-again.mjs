// Debug ranges again
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", JSON.stringify(text1));

// Let's manually step through what should happen
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;

const match = [...text1.matchAll(WORD_HTML_CLOSE_RE)][0];
console.log("\nMatch:", match);
console.log("Match start:", match.index);
console.log("Match end:", match.index + match[0].length);
console.log("Match text:", JSON.stringify(match[0]));

// What should remain
const before = text1.slice(0, match.index);
const after = text1.slice(match.index + match[0].length);
console.log("\nBefore part:", JSON.stringify(before));
console.log("After part:", JSON.stringify(after));
console.log("Combined:", JSON.stringify(before + after));

// Check actual result
const result = stripReasoningTagsFromText(text1);
console.log("\nActual result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
