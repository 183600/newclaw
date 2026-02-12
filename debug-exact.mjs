import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 从测试文件中复制的确切文本
const text = "Text with `inline code` and outside thinking`.";

console.log(`输入文本: ${JSON.stringify(text)}`);
console.log(`输入长度: ${text.length}`);

// 显示每个字符及其代码
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  console.log(
    `位置 ${i}: '${char}' (${code}) ${code === 272 ? "(Đ)" : ""}${code === 273 ? "(đ)" : ""}`,
  );
}

const result = stripReasoningTagsFromText(text);
console.log(`\n输出文本: ${JSON.stringify(result)}`);
console.log(`输出长度: ${result.length}`);

// 检查测试期望
console.log(`\n测试检查:`);
console.log(`包含 "inline code": ${result.includes("inline code")}`);
console.log(`包含 "thinking": ${result.includes("thinking")}`);

// 检查特殊字符版本
console.log(`\n特殊字符检查:`);

// 查找 inline code 后面的字符
const inlineCodeIndex = text.indexOf("inline code");
if (inlineCodeIndex !== -1) {
  const afterInlineCode = text.substring(
    inlineCodeIndex + "inline code".length,
    inlineCodeIndex + "inline code".length + 3,
  );
  console.log(`"inline code" 后面的字符: ${JSON.stringify(afterInlineCode)}`);
}

// 查找 thinking 后面的字符
const thinkingIndex = text.indexOf("thinking");
if (thinkingIndex !== -1) {
  const afterThinking = text.substring(
    thinkingIndex + "thinking".length,
    thinkingIndex + "thinking".length + 3,
  );
  console.log(`"thinking" 后面的字符: ${JSON.stringify(afterThinking)}`);
}
