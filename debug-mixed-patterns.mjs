import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Debug the mixed pattern issues
const testCases = [
  {
    name: "HTML entities mixed pattern",
    text: "Before &#x110;thinking middle thinking&#x111; after.",
  },
  {
    name: "Unicode mixed pattern",
    text: "Before Đthinking content thinkingđ after.",
  },
];

console.log("Debugging mixed pattern processing:\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.text}"`);

  const result = stripReasoningTagsFromText(testCase.text);
  console.log(`Actual: "${result}"`);
  console.log("---\n");
});
