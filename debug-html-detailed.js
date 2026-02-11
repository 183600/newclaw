// Debug HTML tag processing in detail
import * as funcs from "./dist/image-CkP1IYOK.js";

function debugHtmlDetailed() {
  console.log("=== Debugging HTML Tag Processing (Detailed) ===");

  const testHtml = "Before<thinking>internal reasoning</thinking>After";
  console.log("Input:", JSON.stringify(testHtml));
  console.log("Length:", testHtml.length);

  // Show each character with index
  for (let i = 0; i < testHtml.length; i++) {
    if (i >= 5 && i <= 40) {
      // Show relevant section
      const char = testHtml[i];
      console.log(`Index ${i}: "${char}"`);
    }
  }

  // Manually test what the function should do
  console.log("\n=== Expected Processing ===");
  console.log("Should remove characters from index 6 to 44 (</thinking> ends at 34 + 10 = 44)");
  console.log("Expected result: 'Before' + 'After' = 'BeforeAfter'");

  // Test the function
  const result = funcs.g(testHtml); // stripThinkingTagsFromText
  console.log("\n=== Function Result ===");
  console.log("Output:", JSON.stringify(result));
  console.log("Expected:", JSON.stringify("BeforeAfter"));

  // Test with a simpler case
  const simpleHtml = "A<thinking>B</thinking>C";
  const simpleResult = funcs.g(simpleHtml);
  console.log("\n=== Simple Test ===");
  console.log("Input:", JSON.stringify(simpleHtml));
  console.log("Output:", JSON.stringify(simpleResult));
  console.log("Expected:", JSON.stringify("AC"));
}

debugHtmlDetailed();
