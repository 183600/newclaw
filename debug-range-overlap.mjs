// Debug range overlap issue
const text1 = "Before This is thinking</thinking> after.";
console.log("Input:", JSON.stringify(text1));
console.log("Input length:", text1.length);

// Simulate what the function does
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const HTML_THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

const rangesToRemove = [];

// WORD_HTML_CLOSE_RE
const wordMatch = [...text1.matchAll(WORD_HTML_CLOSE_RE)][0];
rangesToRemove.push({
  start: wordMatch.index,
  end: wordMatch.index + wordMatch[0].length,
  desc: "WORD_HTML_CLOSE_RE",
});

// HTML_THINKING_TAG_RE
const htmlMatch = [...text1.matchAll(HTML_THINKING_TAG_RE)][0];
rangesToRemove.push({
  start: htmlMatch.index,
  end: htmlMatch.index + htmlMatch[0].length,
  desc: "HTML_THINKING_TAG_RE",
});

console.log("\nRanges to remove:");
rangesToRemove.forEach((r) => {
  console.log(`  ${r.desc}: [${r.start}, ${r.end}) "${text1.slice(r.start, r.end)}"`);
});

// Sort ranges by start position
rangesToRemove.sort((a, b) => a.start - b.start);

console.log("\nAfter sorting:");
rangesToRemove.forEach((r) => {
  console.log(`  ${r.desc}: [${r.start}, ${r.end})`);
});

// Remove ranges in reverse order
let cleaned = text1;
console.log("\nRemoving ranges in reverse order:");
for (let i = rangesToRemove.length - 1; i >= 0; i--) {
  const range = rangesToRemove[i];
  console.log(`\nStep ${rangesToRemove.length - i}: Removing [${range.start}, ${range.end})`);
  console.log(`  Current text: ${JSON.stringify(cleaned)}`);
  console.log(`  Removing: ${JSON.stringify(cleaned.slice(range.start, range.end))}`);
  cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
  console.log(`  Result: ${JSON.stringify(cleaned)}`);
}

console.log("\nFinal result:", JSON.stringify(cleaned));
