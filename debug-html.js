// Debug HTML tag processing
import * as funcs from "./dist/image-DOhePNiG.js";

function debugHtmlProcessing() {
  console.log("=== Debugging HTML Tag Processing ===");

  const testHtml = "Before<thinking>internal reasoning</thinking>After";
  console.log("Input:", JSON.stringify(testHtml));

  // Test the regex patterns
  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;

  console.log("\n=== Testing THINKING_TAG_RE ===");
  const matches = [...testHtml.matchAll(THINKING_TAG_RE)];
  console.log("Matches:", matches);

  // Test the function
  const result = funcs.g(testHtml); // stripThinkingTagsFromText
  console.log("\n=== Function Result ===");
  console.log("Output:", JSON.stringify(result));
  console.log("Expected:", JSON.stringify("BeforeAfter"));
}

debugHtmlProcessing();
