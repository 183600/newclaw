import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试一些失败的用例
const testCases = [
  {
    name: "short HTML tags",
    text: "Before <t>thinking</t> after.",
    expected: "Before  after.",
  },
  {
    name: "think tags",
    text: "Before contentthinking</think> after.",
    expected: "Before  after.",
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`输入: ${JSON.stringify(test.text)}`);
  console.log(`期望: ${JSON.stringify(test.expected)}`);

  const result = stripReasoningTagsFromText(test.text);
  console.log(`输出: ${JSON.stringify(result)}`);
  console.log(`通过: ${result === test.expected}`);
});
