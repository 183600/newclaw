// Test the original regex patterns
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const test = "Before This is thinking</thinking> after.";
console.log("Input:", test);

// Test if regex matches
const matches = [...test.matchAll(THINKING_TAG_RE)];
console.log("Matches:", matches);

// Check what the regex captures
for (const match of matches) {
  console.log(`Match: "${match[0]}" at index ${match.index}, capture group: "${match[1]}"`);
}
