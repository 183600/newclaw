// Test the HTML_THINKING_TAG_RE regex
const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

const testText = "Before content</thinking> after.";
console.log("Test text:", testText);
console.log("Matches:");
for (const match of testText.matchAll(HTML_THINKING_TAG_RE)) {
  console.log(`  "${match[0]}" at position ${match.index}, isClose: ${match[1] === "/"}`);
}
