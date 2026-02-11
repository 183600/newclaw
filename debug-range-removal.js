// Debug range removal logic
import * as funcs from "./dist/image-CkP1IYOK.js";

function debugRangeRemoval() {
  console.log("=== Debugging Range Removal Logic ===");

  const testHtml = "A<thinking>B</thinking>C";
  console.log("Input:", JSON.stringify(testHtml));
  console.log("Length:", testHtml.length);

  // Show each character with index
  for (let i = 0; i < testHtml.length; i++) {
    const char = testHtml[i];
    console.log(`Index ${i}: "${char}"`);
  }

  // Manually test the range removal logic
  const thinkingRanges = [{ start: 1, end: 23 }];
  console.log("\n=== Manual Range Removal ===");
  console.log("Ranges:", thinkingRanges);

  let cleaned = testHtml;
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(`Removing range [${range.start}, ${range.end}):`);
    console.log(`  Before: "${cleaned}"`);
    console.log(`  slice(0, ${range.start}): "${cleaned.slice(0, range.start)}"`);
    console.log(`  slice(${range.end}): "${cleaned.slice(range.end)}"`);
    cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    console.log(`  After: "${cleaned}"`);
  }

  console.log("\n=== Manual Result ===");
  console.log("Result:", JSON.stringify(cleaned));
  console.log("Expected:", JSON.stringify("AC"));

  // Test the function
  const result = funcs.g(testHtml); // stripThinkingTagsFromText
  console.log("\n=== Function Result ===");
  console.log("Output:", JSON.stringify(result));
  console.log("Expected:", JSON.stringify("AC"));
}

debugRangeRemoval();
