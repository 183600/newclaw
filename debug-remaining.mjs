import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test cases that are still failing
const testCases = [
  {
    name: "should handle mixed HTML entities and tags",
    text: "Before &#x110;thinking middle thinking&#x111; after.",
    expected: "Before  middle  after.",
  },
  {
    name: "should handle Unicode special characters",
    text: "Before \u0110thinking content thinking\u0111 after.",
    expected: "Before  content  after.",
  },
  {
    name: "should handle only opening tags",
    text: "Before <thinking>content after.",
    options: { mode: "strict" },
    expected: "Before ",
  },
];

console.log("Running remaining failing test cases:\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.text}"`);
  console.log(`Expected: "${testCase.expected}"`);

  const result = testCase.options
    ? stripReasoningTagsFromText(testCase.text, testCase.options)
    : stripReasoningTagsFromText(testCase.text);
  console.log(`Actual: "${result}"`);

  const passed = result === testCase.expected;
  console.log(`Status: ${passed ? "PASS" : "FAIL"}`);

  if (!passed) {
    console.log(`Difference analysis:`);
    console.log(`  Expected length: ${testCase.expected.length}`);
    console.log(`  Actual length: ${result.length}`);

    for (let i = 0; i < Math.max(testCase.expected.length, result.length); i++) {
      if (i >= testCase.expected.length) {
        console.log(`  Extra char at pos ${i}: "${result[i]}" (${result.charCodeAt(i)})`);
      } else if (i >= result.length) {
        console.log(
          `  Missing char at pos ${i}: "${testCase.expected[i]}" (${testCase.expected.charCodeAt(i)})`,
        );
      } else if (result[i] !== testCase.expected[i]) {
        console.log(
          `  Char diff at pos ${i}: expected "${testCase.expected[i]}" (${testCase.expected.charCodeAt(i)}), got "${result[i]}" (${result.charCodeAt(i)})`,
        );
      }
    }
  }

  console.log("---\n");
});
