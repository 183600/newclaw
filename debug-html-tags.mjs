// Debug HTML tag regex

const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

// Test short HTML tags
const shortTagsText = "Before <t>thinking</t> after.";
console.log("Short tags text:", JSON.stringify(shortTagsText));
const shortMatches = [...shortTagsText.matchAll(HTML_THINKING_TAG_RE)];
console.log("Short tags matches:");
shortMatches.forEach((match, index) => {
  console.log(`Match ${index}:`, JSON.stringify(match[0]));
  console.log(`Groups:`, match.slice(1));
});

// Test think tags
const thinkTagsText = "Before content\nthinking</think>\nafter.";
console.log("\nThink tags text:", JSON.stringify(thinkTagsText));
const thinkMatches = [...thinkTagsText.matchAll(HTML_THINKING_TAG_RE)];
console.log("Think tags matches:");
thinkMatches.forEach((match, index) => {
  console.log(`Match ${index}:`, JSON.stringify(match[0]));
  console.log(`Groups:`, match.slice(1));
});

// Test individual parts
console.log("\nTesting individual parts:");
console.log("<t> match:", "<t>".match(HTML_THINKING_TAG_RE));
console.log("</t> match:", "</t>".match(HTML_THINKING_TAG_RE));
console.log(" match:", "".match(HTML_THINKING_TAG_RE));
console.log("</think> match:", "</think>".match(HTML_THINKING_TAG_RE));
