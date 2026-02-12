#!/usr/bin/env node

// 检查测试文件中的确切字符
const testText = "Before This is thinking\u0111 after.";
console.log("Test text:");
console.log(JSON.stringify(testText));
console.log("Character codes:");
for (let i = 0; i < testText.length; i++) {
  const char = testText[i];
  const code = char.charCodeAt(0);
  console.log(`Position ${i}: "${char}" (${code})`);
}

// 检查是否包含特殊字符
const hasSpecialChar = testText.includes("\u0111");
console.log(`Contains special đ character: ${hasSpecialChar}`);

// 检查正则表达式匹配
const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)\u0111/g;
const matches = [...testText.matchAll(SPECIAL_CLOSE_RE)];
console.log(`Regex matches:`, matches);
