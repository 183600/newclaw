import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试范围移除问题
const testCases = [
  {
    name: "simple Đthinkingđ",
    text: "Đthinkingđ",
    expected: "",
  },
  {
    name: "Đthinkingđ with spaces",
    text: "Before Đthinkingđ after.",
    expected: "Before  after.",
  },
  {
    name: "multiple Đthinkingđ",
    text: "Start Đthinkingđ middle Đthinkingđ end.",
    expected: "Start  middle  end.",
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`输入: ${JSON.stringify(test.text)}`);
  console.log(`期望: ${JSON.stringify(test.expected)}`);

  const result = stripReasoningTagsFromText(test.text);
  console.log(`输出: ${JSON.stringify(result)}`);
  console.log(`通过: ${result === test.expected}`);

  // 检查长度差异
  if (result.length !== test.expected.length) {
    console.log(`长度差异: 期望 ${test.expected.length}, 实际 ${result.length}`);
  }
});
