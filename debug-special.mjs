import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 手动模拟特殊字符处理
function debugSpecialChars(text) {
  console.log(`调试文本: ${JSON.stringify(text)}`);

  let stack = [];
  let thinkingRanges = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // Check for special character opening tags (Đthinking or Đthought)
    if (code === 272 && i + 8 < text.length) {
      const tagWord = text.substring(i + 1, i + 9);
      console.log(`位置 ${i}: 发现 opening tag Đ${tagWord}`);
      if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
        stack.push({ start: i, type: "special", tag: tagWord });
        i += 9;
        continue;
      }
    }

    // Check for special character closing tags (thinkingđ, thoughtđ, or antthinkingđ)
    if (
      i + 7 < text.length &&
      (text.substring(i, i + 8) === "thinking\u0111" ||
        text.substring(i, i + 7) === "thought\u0111" ||
        text.substring(i, i + 11) === "antthinking\u0111")
    ) {
      let endPos;
      let tagType;
      if (text.substring(i, i + 8) === "thinking\u0111") {
        endPos = i + 8;
        tagType = "thinking";
      } else if (text.substring(i, i + 7) === "thought\u0111") {
        endPos = i + 7;
        tagType = "thought";
      } else if (text.substring(i, i + 11) === "antthinking\u0111") {
        endPos = i + 11;
        tagType = "antthinking";
      }

      console.log(`位置 ${i}: 发现 closing tag ${tagType}đ (endPos: ${endPos})`);

      // Find the matching opening tag
      let found = false;
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === "special") {
          const open = stack.splice(j, 1)[0];
          console.log(`匹配 opening tag: start=${open.start}, tag=${open.tag}`);
          thinkingRanges.push({
            start: open.start,
            end: endPos,
          });
          console.log(`添加范围: ${open.start} 到 ${endPos}`);
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

    i++;
  }

  console.log(`最终范围:`, thinkingRanges);
  console.log(`剩余 stack:`, stack);

  // 应用范围移除
  let result = text;
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    result = result.slice(0, range.start) + result.slice(range.end);
  }

  console.log(`结果: ${JSON.stringify(result)}`);
  return result;
}

// 测试
const text = "Before Đthinkingđ after.";
debugSpecialChars(text);
