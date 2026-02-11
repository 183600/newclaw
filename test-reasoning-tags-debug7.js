import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test the actual text from the test file
const text1 = "Before This is thinking after.";
console.log("Test 1 input:", JSON.stringify(text1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Check if the regex matches
const QUICK_TAG_RE = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>/i;
console.log("Regex matches:", QUICK_TAG_RE.test(text1));

// Find all matches
const globalQuickTagRe = new RegExp(QUICK_TAG_RE.source, "gi");
const matches = [...text1.matchAll(globalQuickTagRe)];
console.log("Matches:", matches);

// Check the THINKING_TAG_RE
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
THINKING_TAG_RE.lastIndex = 0;
const thinkingMatches = [...text1.matchAll(THINKING_TAG_RE)];
console.log("Thinking matches:", thinkingMatches);
