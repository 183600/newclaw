// Debug complete HTML tag processing

const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

function processHTMLTags(text) {
  const thinkingRanges = [];
  const stack = [];

  // Find all HTML thinking tags
  HTML_THINKING_TAG_RE.lastIndex = 0;
  for (const match of text.matchAll(HTML_THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    console.log(`Found tag: ${JSON.stringify(match[0])}, at ${idx}, isClose: ${isClose}`);

    if (!isClose) {
      stack.push({ start: idx, type: "html", tag: match[0] });
      console.log(`  Pushed to stack: ${JSON.stringify(stack[stack.length - 1])}`);
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
      console.log(`  Popped from stack: ${JSON.stringify(open)}`);
      console.log(`  Added range: ${open.start} to ${idx + match[0].length}`);
    } else {
      // Unmatched closing tag, remove it
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
      console.log(`  Unmatched closing tag, added range: ${idx} to ${idx + match[0].length}`);
    }
  }

  // Handle unclosed tags
  if (stack.length > 0) {
    console.log(`Unclosed tags in stack: ${stack.length}`);
    for (const open of stack) {
      console.log(`  Unclosed: ${JSON.stringify(open)}`);
    }
  }

  return thinkingRanges;
}

// Test short HTML tags
console.log("=== Testing short HTML tags ===");
const shortTagsText = "Before <t>thinking</t> after.";
console.log("Input:", JSON.stringify(shortTagsText));
const shortRanges = processHTMLTags(shortTagsText);
console.log("Ranges to remove:", shortRanges);

// Apply removals
let result = shortTagsText;
for (let i = shortRanges.length - 1; i >= 0; i--) {
  const range = shortRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));

// Test think tags
console.log("\n=== Testing think tags ===");
const thinkTagsText = "Before content\nthinking content</think>\nafter.";
console.log("Input:", JSON.stringify(thinkTagsText));
const thinkRanges = processHTMLTags(thinkTagsText);
console.log("Ranges to remove:", thinkRanges);

// Apply removals
result = thinkTagsText;
for (let i = thinkRanges.length - 1; i >= 0; i--) {
  const range = thinkRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
