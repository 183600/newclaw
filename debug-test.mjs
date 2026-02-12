import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试失败的用例
const testCases = [
  {
    name: "inline code preservation",
    text: "Text with `inline code` and outside thinking`.",
    expected: {
      contains: "inline code",
      notContains: "thinking",
    },
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`输入: ${JSON.stringify(test.text)}`);

  const result = stripReasoningTagsFromText(test.text);
  console.log(`输出: ${JSON.stringify(result)}`);

  if (test.expected.contains) {
    console.log(`应该包含: ${test.expected.contains}`);
    console.log(`实际包含: ${result.includes(test.expected.contains)}`);
  }

  if (test.expected.notContains) {
    console.log(`不应该包含: ${test.expected.notContains}`);
    console.log(`实际不包含: ${!result.includes(test.expected.notContains)}`);
  }
});
