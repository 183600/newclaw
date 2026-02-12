import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试 HTML 标签转换
const testCases = [
  {
    name: "HTML tag conversion",
    text: "<t>thinking</t>",
    steps: [],
  },
  {
    name: "full sentence",
    text: "Before <t>thinking</t> after.",
    steps: [],
  },
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${test.name} ===`);
  console.log(`输入: ${JSON.stringify(test.text)}`);

  // 手动测试转换步骤
  let step1 = test.text.replace(/<t>thinking/g, "Đthinking");
  console.log(`步骤1 (替换 <t>thinking): ${JSON.stringify(step1)}`);

  let step2 = step1.replace(/thinking<\/t>/g, "thinkingđ");
  console.log(`步骤2 (替换 thinking</t>): ${JSON.stringify(step2)}`);

  const result = stripReasoningTagsFromText(test.text);
  console.log(`最终结果: ${JSON.stringify(result)}`);
});
