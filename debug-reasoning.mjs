import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test specific failing cases
const tests = [
  { name: "only reasoning tags", text: "thinking" },
  { name: "Before thinking after", text: "Before thinking after" },
  {
    name: "various word prefixes",
    text: "Zero thinking One thinking Two thinking Three thinking Four thinking",
  },
  {
    name: "word patterns at different positions",
    text: "Start This is thinking middle First thought end Second antthinking",
  },
  { name: "none trim mode", text: "  Before thinking  after  ", options: { trim: "none" } },
  { name: "start trim mode", text: "  Before thinking  after  ", options: { trim: "start" } },
  { name: "both trim mode", text: "Before thinking after", options: { trim: "both" } },
];

for (const test of tests) {
  console.log(`\n=== ${test.name} ===`);
  console.log(`Input: "${test.text}"`);
  const result = stripReasoningTagsFromText(test.text, test.options);
  console.log(`Output: "${result}"`);
}
