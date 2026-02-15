import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test cases that are failing
const testCases = [
  {
    name: "should handle mixed HTML entities and special characters",
    input: "&#x110;thinking content thinking&#x111; and Đmore thinkingđ",
    expected: " and ",
    options: {},
  },
  {
    name: "should handle malformed HTML entities",
    input: "&#x110;thinking content&#x111; and &#x110;thinking",
    expected: " and ",
    options: {},
  },
  {
    name: "should handle multiple code blocks with reasoning tags",
    input: `
\`\`\`javascript
// thinking in code
function test() { return Đthinkingđ; }
\`\`\`
Middle thinking
\`\`\`python
# more thinking in code
def func(): pass
\`\`\`
End thinking`,
    expected: null, // We'll print the actual result
    options: {},
  },
  {
    name: "should handle overlapping special character patterns",
    input: "Đthinkingthinkingđ content",
    expected: " content",
    options: {},
  },
  {
    name: "should handle mixed HTML and special character tags",
    input: "<thinking>Đnested thinkingđ</thinking> outside",
    expected: " outside",
    options: {},
  },
  {
    name: "should handle various word prefixes",
    input: "Zero thinking One thinking Two thinking Three thinking Four thinking",
    expected: "Zero   One   Two   Three   Four ",
    options: {},
  },
  {
    name: "should handle word patterns with punctuation",
    input: "First thinking. Second thought! Third antthinking?",
    expected: "First . Second ! Third ?",
    options: {},
  },
  {
    name: "should handle word patterns at different positions",
    input: "Start This is thinking middle First thought end Second antthinking",
    expected: "Start  middle  end ",
    options: {},
  },
  {
    name: "should handle 'strict' mode with unclosed HTML tags",
    input: "Before <thinking content after",
    expected: "Before ",
    options: { mode: "strict" },
  },
  {
    name: "should handle 'preserve' mode with unclosed special tags",
    input: "Before Đthinking content after",
    expected: " content after",
    options: { mode: "preserve" },
  },
  {
    name: "should handle multiple unclosed patterns in 'preserve' mode",
    input: "First Đthinking content <thinking more content",
    expected: " content  more content",
    options: { mode: "preserve" },
  },
  {
    name: "should handle malformed tags",
    input: "Before <thinking after</thinking>",
    expected: "Before ",
    options: {},
  },
];

console.log("Testing failing cases:\n");

testCases.forEach((testCase, index) => {
  const result = stripReasoningTagsFromText(testCase.input, testCase.options);
  const passed = testCase.expected === null || result === testCase.expected;

  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.input)}`);
  console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
  console.log(`   Actual: ${JSON.stringify(result)}`);
  console.log(`   Status: ${passed ? "PASS" : "FAIL"}`);
  console.log("");
});
