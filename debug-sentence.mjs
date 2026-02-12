import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 测试句子中的范围移除
const text = "Before Đthinkingđ after.";

console.log(`输入: ${JSON.stringify(text)}`);

// 手动分析
console.log(`\n字符分析:`);
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  const special = code === 272 ? "(Đ)" : code === 273 ? "(đ)" : "";
  console.log(`位置 ${i}: '${char}' (${code}) ${special}`);
}

console.log(`\n预期:`);
console.log(`Đthinkingđ 应该从位置 7 到 17 (包含 Đ 和 đ)`);
console.log(`移除后应该剩下: "Before  after."`);

const result = stripReasoningTagsFromText(text);
console.log(`\n实际结果: ${JSON.stringify(result)}`);
console.log(`实际长度: ${result.length}`);

// 检查是否包含 "after"
console.log(`包含 "after": ${result.includes("after")}`);

// 测试一个更简单的案例
console.log(`\n=== 测试简单案例 ===`);
const simpleText = "A Đthinkingđ B";
console.log(`输入: ${JSON.stringify(simpleText)}`);
const simpleResult = stripReasoningTagsFromText(simpleText);
console.log(`输出: ${JSON.stringify(simpleResult)}`);
console.log(`期望: "A  B"`);
console.log(`通过: ${simpleResult === "A  B"}`);
