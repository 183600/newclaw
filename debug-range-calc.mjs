import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 详细跟踪范围计算
function debugRangeCalculation(text) {
  console.log(`输入: ${JSON.stringify(text)}`);

  let stack = [];
  let thinkingRanges = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // Check for closing tags first
    if (
      i + 7 < text.length &&
      (text.substring(i, i + 8) === "thinkingđ" ||
        text.substring(i, i + 7) === "thoughtđ" ||
        text.substring(i, i + 11) === "antthinkingđ")
    ) {
      console.log(`\n位置 ${i}: 发现 closing tag`);
      let endPos;
      if (text.substring(i, i + 8) === "thinkingđ") {
        endPos = i + 8;
        console.log(`  thinkingđ: 位置 ${i} 到 ${endPos}`);
      } else if (text.substring(i, i + 7) === "thoughtđ") {
        endPos = i + 7;
        console.log(`  thoughtđ: 位置 ${i} 到 ${endPos}`);
      } else if (text.substring(i, i + 11) === "antthinkingđ") {
        endPos = i + 11;
        console.log(`  antthinkingđ: 位置 ${i} 到 ${endPos}`);
      }

      // Find matching opening tag
      let found = false;
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === "special") {
          const open = stack.splice(j, 1)[0];
          console.log(`  匹配 opening tag 在位置 ${open.start}`);
          console.log(`  添加范围: ${open.start} 到 ${endPos}`);
          thinkingRanges.push({
            start: open.start,
            end: endPos,
          });
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`  未匹配的 closing tag`);
        console.log(`  添加范围: ${i} 到 ${endPos}`);
        thinkingRanges.push({
          start: i,
          end: endPos,
        });
      }

      i = endPos;
      continue;
    }

    // Check for opening tags
    if (code === 272 && i + 7 < text.length) {
      // Check for different tag lengths
      let tagWord = text.substring(i + 1, i + 9);
      if (tagWord.startsWith("thinking")) {
        console.log(`\n位置 ${i}: 发现 opening tag Đthinking`);
        stack.push({ start: i, type: "special" });
        i += 9;
        continue;
      }

      tagWord = text.substring(i + 1, i + 8);
      if (tagWord.startsWith("thought")) {
        console.log(`\n位置 ${i}: 发现 opening tag Đthought`);
        stack.push({ start: i, type: "special" });
        i += 8;
        continue;
      }

      tagWord = text.substring(i + 1, i + 11);
      if (tagWord.startsWith("antthinking")) {
        console.log(`\n位置 ${i}: 发现 opening tag Đantthinking`);
        stack.push({ start: i, type: "special" });
        i += 11;
        continue;
      }
    }

    i++;
  }

  console.log(`\n最终范围:`, thinkingRanges);
  console.log(`剩余 stack:`, stack);

  // Apply ranges
  let result = text;
  console.log(`\n应用范围移除:`);
  for (let i = thinkingRanges.length - 1; i >= 0; i--) {
    const range = thinkingRanges[i];
    const toRemove = result.slice(range.start, range.end);
    console.log(`  移除范围 ${range.start}-${range.end}: "${toRemove}"`);
    result = result.slice(0, range.start) + result.slice(range.end);
    console.log(`  当前结果: "${result}"`);
  }

  console.log(`\n最终结果: "${result}"`);
  return result;
}

// 测试
const text = "A Đthinkingđ B";
debugRangeCalculation(text);

console.log(`\n=== 实际函数结果 ===`);
const actualResult = stripReasoningTagsFromText(text);
console.log(`"${actualResult}"`);
