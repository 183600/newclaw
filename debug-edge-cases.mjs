import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test cases that are failing
const testCases = [
  {
    name: "handles malformed nested tags",
    text: "Before <thinking>unclosed <thought>nested</thinking> after",
    expected: "Before  after",
  },
  {
    name: "handles mixed encoding scenarios",
    text: "Before Đthinking&#x111; content after",
    expected: "Before  content after",
  },
  {
    name: "handles zero-width characters",
    text: "Before\u200Bthinking\u200Bafter\u200B",
    expected: "Before\u200Bafter\u200B",
  },
  {
    name: "handles bidirectional text",
    text: "Before thinking\u05D0after", // Hebrew character
    expected: "Before \u05D0after",
  },
];

console.log("Running failing edge case tests:\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.text}"`);
  console.log(`Expected: "${testCase.expected}"`);

  const result = stripReasoningTagsFromText(testCase.text);
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
