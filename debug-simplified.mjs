// Let's create a simplified version of the function with debug logs
function debugStripReasoningTagsFromText(text) {
  if (!text) {
    return text;
  }

  const mode = "strict"; // Default mode
  const trimMode = "both"; // Default trim mode

  let cleaned = text;
  const rangesToRemove = [];

  // Define the HTML thinking tag regex
  const HTML_THINKING_TAG_RE =
    /<\s*(\/?)\s*(?:t|think|thinking|thought|antthinking)(?:\b[^<>]*>|\/?>|>)/gi;

  // Handle thinking tags
  const thinkingRanges = [];
  const stack = [];

  console.log("Processing text:", cleaned);

  // Find all HTML thinking tags
  HTML_THINKING_TAG_RE.lastIndex = 0;
  for (const match of cleaned.matchAll(HTML_THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    console.log(`Found tag: "${match[0]}" at position ${idx}, isClose: ${isClose}`);

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
      console.log("Pushed to stack, stack length:", stack.length);
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
      console.log("Found matching open tag, added range:", {
        start: open.start,
        end: idx + match[0].length,
      });
    } else {
      // Unmatched closing tag, remove it
      thinkingRanges.push({
        start: idx,
        end: idx + match[0].length,
      });
      console.log("Unmatched closing tag, added range:", {
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  console.log("Final thinkingRanges:", thinkingRanges);
  console.log("Final stack:", stack);

  rangesToRemove.push(...thinkingRanges);
  console.log("Final rangesToRemove:", rangesToRemove);

  // Remove ranges in reverse order to maintain indices
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    console.log(`Removing range ${i}:`, range);
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    console.log("Text after removal:", cleaned);
  }

  return cleaned;
}

// Test the function
console.log("=== Debugging Only Closing Tags ===");
const onlyClosingText = "Before content</thinking> after.";
const result = debugStripReasoningTagsFromText(onlyClosingText);
console.log("Final result:", result);
console.log("Expected: Before  after.");
