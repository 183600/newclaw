// 详细分析 "Before Đthinkingđ after." 的字符位置
const text = "Before Đthinkingđ after.";

console.log(`文本: ${JSON.stringify(text)}`);
console.log(`长度: ${text.length}`);

for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  const special = code === 272 ? "(Đ)" : code === 273 ? "(đ)" : "";
  console.log(`位置 ${i}: '${char}' (${code}) ${special}`);
}

// 查找 Đthinking
const đIndex = text.indexOf("Đ");
if (đIndex !== -1) {
  console.log(`\nĐ 在位置 ${đIndex}`);
  const afterĐ = text.substring(đIndex + 1, đIndex + 9);
  console.log(`Đ 后面的 8 个字符: ${JSON.stringify(afterĐ)}`);
}

// 查找 thinkingđ
const thinkingđIndex = text.indexOf("thinkingđ");
if (thinkingđIndex !== -1) {
  console.log(`\nthinkingđ 在位置 ${thinkingđIndex}`);
} else {
  console.log(`\n未找到 thinkingđ`);

  // 查找 thinking
  const thinkingIndex = text.indexOf("thinking");
  if (thinkingIndex !== -1) {
    console.log(`thinking 在位置 ${thinkingIndex}`);
    const afterThinking = text.substring(thinkingIndex + 8, thinkingIndex + 9);
    console.log(`thinking 后面的字符: '${afterThinking}' (${afterThinking.charCodeAt(0)})`);
  }
}
