// Debug regex final check
const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

const testCases = ["</t>", "</thinking>", "thinking</t>", "inline code</t>"];

console.log("Testing HTML_THINKING_TAG_RE:");
for (const test of testCases) {
  const matches = [...test.matchAll(HTML_THINKING_TAG_RE)];
  console.log(`  "${test}": ${matches.length > 0 ? matches.map((m) => m[0]) : "no match"}`);
}

// Test the actual text
const text = "Text with `inline code</t>` and outside thinking</t>.";
console.log("\nFull text matches:");
const matches = [...text.matchAll(HTML_THINKING_TAG_RE)];
console.log(`  Found ${matches.length} matches:`);
matches.forEach((m, i) => {
  console.log(`    ${i}: "${m[0]}" at index ${m.index}`);
});
