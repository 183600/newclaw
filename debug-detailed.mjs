import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 详细测试失败的用例
const text = "Text with `inline code` and outside thinking`.";

console.log(`输入文本: ${JSON.stringify(text)}`);
console.log(`输入长度: ${text.length}`);

// 显示每个字符的代码
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  console.log(`位置 ${i}: '${char}' (${code})`);
}

const result = stripReasoningTagsFromText(text);
console.log(`\n输出文本: ${JSON.stringify(result)}`);
console.log(`输出长度: ${result.length}`);

// 检查 thinking 后面的字符
const thinkingIndex = text.indexOf("thinking");
if (thinkingIndex !== -1) {
  console.log(`\n'thinking' 在位置 ${thinkingIndex}`);
  console.log(
    `'thinking' 后面的字符: '${text[thinkingIndex + 8]}' (${text.charCodeAt(thinkingIndex + 8)})`,
  );
}
