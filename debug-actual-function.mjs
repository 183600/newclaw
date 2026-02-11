// Import and test the actual function
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test cases from the failing tests
const testCases = [
  {
    name: "should remove simple thinking tags",
    input: "Before This is thinking after.",
    expected: "Before  after.",
  },
  {
    name: "should handle multiple thinking blocks",
    input: "Start First thought middle Second thought end.",
    expected: "Start  middle  end.",
  },
  {
    name: "should preserve unclosed thinking tags in preserve mode",
    input: "Before Unclosed thinking content",
    expected: "Unclosed thinking content",
  },
  {
    name: "should remove unclosed thinking tags in strict mode",
    input: "Before Unclosed thinking content",
    expected: "Before ",
  },
];

for (const testCase of testCases) {
  console.log(`\n=== ${testCase.name} ===`);
  console.log(`Input: "${testCase.input}"`);
  console.log(`Expected: "${testCase.expected}"`);

  const result = stripReasoningTagsFromText(
    testCase.input,
    testCase.name.includes("preserve") ? { mode: "preserve" } : {},
  );
  console.log(`Actual: "${result}"`);
  console.log(`Pass: ${result === testCase.expected}`);

  // Debug character by character
  console.log("Character analysis:");
  for (let i = 0; i < testCase.input.length; i++) {
    const char = testCase.input[i];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      console.log(`[${i}]: Non-printable char ${code} (0x${code.toString(16)})`);
    }
  }
}
