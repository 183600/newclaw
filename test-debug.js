import { stripReasoningTagsFromText } from "./dist/shared/text/reasoning-tags.js";

const testCases = [
  {
    name: "Simple thinking tag",
    input: "Before This is thinking</thinking> after.",
    expected: "Before  after.",
  },
  {
    name: "Multiple thinking blocks",
    input: "Start First thought</thinking> middle Second thought</thinking> end.",
    expected: "Start  middle  end.",
  },
];

for (const testCase of testCases) {
  console.log(`\nTest: ${testCase.name}`);
  console.log(`Input: ${testCase.input}`);
  console.log(`Expected: ${testCase.expected}`);

  // First test if QUICK_TAG_RE matches
  const QUICK_TAG_RE =
    /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
  console.log(`QUICK_TAG_RE matches: ${QUICK_TAG_RE.test(testCase.input)}`);

  // Test the unpaired word tag regex
  const unpairedWordTagRe = /\b(thinking|thought|antthinking)<\/\1>/gi;
  const matches = testCase.input.match(unpairedWordTagRe);
  console.log(`Unpaired word tag matches: ${JSON.stringify(matches)}`);

  const result = stripReasoningTagsFromText(testCase.input);
  console.log(`Actual: ${result}`);
  console.log(`Pass: ${result === testCase.expected}`);
}
