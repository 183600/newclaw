import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// 测试用例 - 从测试文件中复制
const text = "Text with \`inline code";

console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));
console.log('Expected to contain "inline code":', result.includes("inline code"));
console.log('Expected not to contain "thinking":', result.includes("thinking"));

// 检查字符编码
console.log("\nCharacter analysis of result:");
for (let i = 0; i < result.length; i++) {
  const char = result[i];
  const code = char.charCodeAt(0);
  const special = code > 127 ? ` (Unicode: U+${code.toString(16).toUpperCase()})` : "";
  if (code > 127 || char === "`" || char === "đ") {
    console.log(`  [${i}] '${char}' (code: ${code})${special}`);
  }
}
