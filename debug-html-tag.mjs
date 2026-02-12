// Debug HTML_THINKING_TAG_RE
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", JSON.stringify(text1));

// Check if HTML_THINKING_TAG_RE matches anything
const matches = [...text1.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nHTML_THINKING_TAG_RE matches:", matches);

// Check after removing the word+tag part
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const match = [...text1.matchAll(WORD_HTML_CLOSE_RE)][0];
const afterRemoval = text1.slice(0, match.index) + text1.slice(match.index + match[0].length);
console.log("\nAfter word+tag removal:", JSON.stringify(afterRemoval));

// Check if HTML_THINKING_TAG_RE matches the remaining text
const remainingMatches = [...afterRemoval.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nHTML_THINKING_TAG_RE matches in remaining text:", remainingMatches);
