import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试重叠的特殊字符标签
const testCases = [
  {
    name: "Đthinkingđ (overlapping)",
    text: "Đthinkingđ",
    description: "Đ 和 thinkingđ 重叠",
  },
  {
    name: "Đthoughtđ (overlapping)",
    text: "Đthoughtđ",
    description: "Đ 和 thoughtđ 重叠",
  },
  {
    name: "in sentence",
    text: "Before Đthinkingđ after.",
    description: "句子中的重叠标签",
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`描述: ${test.description}`);
  console.log(`输入: ${JSON.stringify(test.text)}`);

  const result = stripReasoningTagsFromText(test.text);
  console.log(`输出: ${JSON.stringify(result)}`);

  // 分析字符位置
  console.log(`字符分析:`);
  for (let i = 0; i < test.text.length; i++) {
    const char = test.text[i];
    const code = char.charCodeAt(0);
    const special = code === 272 ? "(Đ)" : code === 273 ? "(đ)" : "";
    if (special) {
      console.log(`  位置 ${i}: '${char}' (${code}) ${special}`);
    }
  }
});
