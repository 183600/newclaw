// Debug other logic that might affect thinkingRanges
import * as funcs from "./dist/image-L4UW4cTi.js";

function debugOtherLogic() {
  console.log("=== Debugging Other Logic ===");

  const testHtml = "A<thinking>B</thinking>C";
  console.log("Input:", JSON.stringify(testHtml));

  // Test the unpairedWordTagRe regex
  const unpairedWordTagRe =
    /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;
  console.log("\n=== Testing unpairedWordTagRe ===");
  const unpairedMatches = [...testHtml.matchAll(unpairedWordTagRe)];
  console.log("Matches:", unpairedMatches);

  // Test the plainClosingTagRe regex
  const plainClosingTagRe = /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;
  console.log("\n=== Testing plainClosingTagRe ===");
  const plainMatches = [...testHtml.matchAll(plainClosingTagRe)];
  console.log("Matches:", plainMatches);

  // Test with a case that should match
  const testHtml2 = "word thinking</thinking> end";
  console.log("\n=== Testing with matching case ===");
  console.log("Input:", JSON.stringify(testHtml2));
  const plainMatches2 = [...testHtml2.matchAll(plainClosingTagRe)];
  console.log("plainClosingTagRe matches:", plainMatches2);

  // Test the function
  const result = funcs.g(testHtml); // stripThinkingTagsFromText
  console.log("\n=== Function Result ===");
  console.log("Output:", JSON.stringify(result));
  console.log("Expected:", JSON.stringify("AC"));
}

debugOtherLogic();
