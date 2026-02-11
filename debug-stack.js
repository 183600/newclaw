// Debug stack processing
import * as funcs from "./dist/image-CkP1IYOK.js";

function debugStackProcessing() {
  console.log("=== Debugging Stack Processing ===");

  const testHtml = "A<thinking>B</thinking>C";
  console.log("Input:", JSON.stringify(testHtml));

  // Manually simulate the HTML tag processing logic
  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

  let stack = [];
  let thinkingRanges = [];

  console.log("\n=== Simulating HTML Tag Processing ===");
  for (const match of testHtml.matchAll(THINKING_TAG_RE)) {
    const idx = match.index ?? 0;
    const isClose = match[1] === "/";

    console.log(`Match at index ${idx}: "${match[0]}" (isClose: ${isClose})`);

    if (!isClose) {
      stack.push({ start: idx, type: "html" });
      console.log(`  -> Pushed to stack:`, stack);
    } else if (stack.length > 0 && stack[stack.length - 1].type === "html") {
      const open = stack.pop();
      thinkingRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
      console.log(`  -> Popped from stack, added range:`, thinkingRanges);
    } else {
      console.log(`  -> No matching opening tag in stack`);
    }
  }

  console.log("\n=== Final Stack State ===");
  console.log("Stack:", stack);
  console.log("Thinking ranges:", thinkingRanges);

  if (stack.length > 0) {
    console.log("ERROR: Stack has unclosed tags!");
  }

  // Test the function
  const result = funcs.g(testHtml); // stripThinkingTagsFromText
  console.log("\n=== Function Result ===");
  console.log("Output:", JSON.stringify(result));
  console.log("Expected:", JSON.stringify("AC"));
}

debugStackProcessing();
