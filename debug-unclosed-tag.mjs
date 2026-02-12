// Debug unclosed tag handling
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const text5 = "Before <thinking Unclosed thinking content";
console.log("Input:", JSON.stringify(text5));

// Check if HTML_THINKING_TAG_RE matches
const matches = [...text5.matchAll(HTML_THINKING_TAG_RE)];
console.log("\nHTML_THINKING_TAG_RE matches:", matches);

// Check what should match
console.log("\nShould match '<thinking':", HTML_THINKING_TAG_RE.test("<thinking"));
HTML_THINKING_TAG_RE.lastIndex = 0; // Reset after test
