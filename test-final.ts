import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// 测试用例
const text = "Text with `inline code\n";

console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));

// 检查是否包含期望的字符串
const expected = "inline code\n";
console.log("Expected:", JSON.stringify(expected));
console.log("Contains expected:", result.includes(expected));

// 检查每个字符
console.log("\nCharacter analysis:");
for (let i = 0; i < expected.length; i++) {
  const expectedChar = expected[i];
  const resultIndex = result.indexOf(expected);
  if (resultIndex !== -1 && resultIndex + i < result.length) {
    const resultChar = result[resultIndex + i];
    console.log(
      `  [${i}] Expected: ${JSON.stringify(expectedChar)} (code: ${expectedChar.charCodeAt(0)}), Got: ${JSON.stringify(resultChar)} (code: ${resultChar.charCodeAt(0)})`,
    );
  }
}
