import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// 测试用例 - 使用正确的特殊字符
const text = "Text with `inline codeđ` and outside thinkingđ.";

console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));
console.log('Expected to contain "inline codeđ":', result.includes("inline codeđ"));
console.log('Expected not to contain "thinkingđ":', result.includes("thinkingđ"));

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
