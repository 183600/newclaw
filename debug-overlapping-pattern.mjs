import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 检查重叠模式
function checkOverlappingPattern(text) {
  console.log(`检查重叠模式: ${JSON.stringify(text)}`);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // Check for Đ followed by thinking
    if (code === 272 && i + 9 < text.length) {
      const afterĐ = text.substring(i + 1, i + 9);
      if (afterĐ === "thinking") {
        console.log(`位置 ${i}: 发现 Đthinking`);

        // Check if thinkingđ follows
        if (i + 9 < text.length && text.charCodeAt(i + 9) === 273) {
          console.log(`位置 ${i + 9}: 发现 đ`);
          console.log(`重叠模式: Đthinkingđ 从位置 ${i} 到 ${i + 10}`);

          // Check what comes after
          if (i + 10 < text.length) {
            console.log(`后面的字符: "${text.substring(i + 10)}"`);
          }
        }
      }
    }
  }
}

// 测试不同的文本
const testCases = ["A Đthinkingđ B", "Before Đthinkingđ after.", "Đthinkingđ", "Đthoughtđ"];

testCases.forEach((test) => {
  checkOverlappingPattern(test);
  console.log(`---`);
});
