// Debug think tags with correct text

const HTML_THINKING_TAG_RE =
  /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

function processHTMLTags(text, mode = "strict") {
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

  // Handle unclosed tags in strict mode
  if (stack.length > 0 && mode === "strict") {
    console.log(`Unclosed tags in stack: ${stack.length}`);
    for (const open of stack) {
      console.log(`  Unclosed: ${JSON.stringify(open)}`);

      // For HTML tags, find the end of the opening tag
      const tagMatch = text.slice(open.start).match(/^<[^>]*>/);
      if (tagMatch) {
        const tagEnd = open.start + tagMatch[0].length;
        console.log(`    Tag ends at: ${tagEnd}`);

        // Look for a newline after the tag content
        const remainingContent = text.slice(tagEnd);
        const newlineIndex = remainingContent.indexOf("\n");
        console.log(`    Newline index: ${newlineIndex}`);

        if (newlineIndex !== -1) {
          // If there's a newline, remove only up to the newline
          thinkingRanges.push({
            start: open.start,
            end: tagEnd + newlineIndex,
          });
          console.log(`    Added range: ${open.start} to ${tagEnd + newlineIndex}`);
        } else {
          // If no newline, remove everything from the tag start
          thinkingRanges.push({
            start: open.start,
            end: text.length,
          });
          console.log(`    Added range: ${open.start} to ${text.length}`);
        }
      }
    }
  }

  return thinkingRanges;
}

// Test think tags with correct text
console.log("=== Testing think tags (correct text) ===");
const thinkTagsText = "Before content" + "<" + "think" + ">" + " after.";
console.log("Input:", JSON.stringify(thinkTagsText));
console.log("Text length:", thinkTagsText.length);

// Find all tags first
const allMatches = [...thinkTagsText.matchAll(HTML_THINKING_TAG_RE)];
console.log("All matches:");
allMatches.forEach((match, index) => {
  console.log(`  ${index}: ${JSON.stringify(match[0])} at ${match.index}`);
});

// Process tags
const thinkRanges = processHTMLTags(thinkTagsText, "strict");
console.log("Ranges to remove:", thinkRanges);

// Apply removals
let result = thinkTagsText;
for (let i = thinkRanges.length - 1; i >= 0; i--) {
  const range = thinkRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
