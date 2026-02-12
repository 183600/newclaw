import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 详细调试 Đthoughtđ
const text = "Đthoughtđ";

console.log(`输入: ${JSON.stringify(text)}`);
console.log(`长度: ${text.length}`);

// 手动模拟修复后的逻辑
function debugFixedLogic(text) {
  let stack = [];
  let thinkingRanges = [];
  let i = 0;

  console.log(`\n开始处理...`);

  while (i < text.length) {
    const char = text[i];
    const code = char.charCodeAt(0);

    console.log(`\n位置 ${i}: '${char}' (${code})`);

    // Check for special character closing tags FIRST
    if (
      i + 7 < text.length &&
      (text.substring(i, i + 8) === "thinking\u0111" ||
        text.substring(i, i + 7) === "thought\u0111" ||
        text.substring(i, i + 11) === "antthinking\u0111")
    ) {
      console.log(`发现 closing tag`);
      let endPos;
      if (text.substring(i, i + 8) === "thinking\u0111") {
        endPos = i + 8;
      } else if (text.substring(i, i + 7) === "thought\u0111") {
        endPos = i + 7;
      } else if (text.substring(i, i + 11) === "antthinking\u0111") {
        endPos = i + 11;
      }

      // Find the matching opening tag
      let found = false;
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === "special") {
          const open = stack.splice(j, 1)[0];
          console.log(`匹配 opening tag 在位置 ${open.start}`);
          thinkingRanges.push({
            start: open.start,
            end: endPos,
          });
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`未匹配的 closing tag`);
        thinkingRanges.push({
          start: i,
          end: endPos,
        });
      }

      i = endPos;
      continue;
    }

    // Check for special character opening tags
    if (code === 272 && i + 8 < text.length) {
      const tagWord = text.substring(i + 1, i + 9);
      console.log(`检查 opening tag: '${tagWord}'`);
      if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
        console.log(`发现 opening tag Đ${tagWord}`);
        stack.push({ start: i, type: "special" });
        i += 9;
        continue;
      }
    }

    i++;
  }

  console.log(`\n最终范围:`, thinkingRanges);
  console.log(`剩余 stack:`, stack);

  // 应用范围移除
  let result = text;
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    console.log(`移除范围 ${range.start}-${range.end}: "${result.slice(range.start, range.end)}"`);
    result = result.slice(0, range.start) + result.slice(range.end);
  }

  console.log(`结果: ${JSON.stringify(result)}`);
  return result;
}

debugFixedLogic(text);

console.log(`\n实际函数结果:`);
const actualResult = stripReasoningTagsFromText(text);
console.log(`${JSON.stringify(actualResult)}`);
