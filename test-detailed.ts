import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// 测试用例 - 使用正确的字符串
const text = "Text with `inline code\n";

console.log("Input:", JSON.stringify(text));
console.log("Input length:", text.length);
console.log("Input characters:");
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  console.log(`  [${i}] '${char}' (code: ${code})`);
}

const result = stripReasoningTagsFromText(text);
console.log("\nResult:", JSON.stringify(result));
console.log("Result length:", result.length);

// 检查期望的字符串
const expected = "inline code\n";
console.log("\nExpected:", JSON.stringify(expected));
console.log("Expected length:", expected.length);
console.log("Expected characters:");
for (let i = 0; i < expected.length; i++) {
  const char = expected[i];
  const code = char.charCodeAt(0);
  console.log(`  [${i}] '${char}' (code: ${code})`);
}

console.log("\nContains expected:", result.includes(expected));

// 查找期望的字符串在结果中的位置
const index = result.indexOf(expected);
if (index !== -1) {
  console.log("Found at index:", index);
  console.log(
    "Context:",
    JSON.stringify(result.substring(Math.max(0, index - 5), index + expected.length + 5)),
  );
}
