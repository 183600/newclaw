import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试不同的 thinking 模式
const testCases = [
  "thinking`.", // thinking + backtick
  "thinking`", // thinking + backtick without period
  "thinking", // just thinking
  "thinkingđ", // thinking + special char
  "thinking</t>", // thinking + HTML tag
];

testCases.forEach((test) => {
  console.log(`\n=== 测试: ${JSON.stringify(test)} ===`);
  const result = stripReasoningTagsFromText(test);
  console.log(`输出: ${JSON.stringify(result)}`);
});
