// 直接模拟 preserve 模式的逻辑

function testPreserveMode(text) {
  console.log("Input:", text);

  // 查找开放的特殊字符标签
  let stack = [];
  let i = 0;

  while (i < text.length) {
    // 检查特殊字符开放标签 (Đthinking 或 Đthought)
    if (text.charCodeAt(i) === 272 && i + 7 < text.length) {
      const tagWord = text.substring(i + 1, i + 9);
      console.log(`Found Đ character at position ${i}, tagWord: "${tagWord}"`);
      if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
        console.log(`Pushing open tag to stack at position ${i}`);
        stack.push({ start: i, type: "special" });
        i += 8;
        continue;
      }
    }
    i++;
  }

  console.log("Stack after scanning:", stack);

  // Preserve mode: 只返回未闭合标签的内容
  if (stack.length > 0) {
    let result = "";
    for (const open of stack) {
      if (open.type === "special") {
        // 对于特殊字符标签，内容从标签词之后开始
        const tagWord = text.substring(open.start + 1, open.start + 9);
        console.log(`Processing open tag: "${tagWord}" at position ${open.start}`);
        if (tagWord === "thinking" || tagWord === "thought" || tagWord === "antthinking") {
          const contentStart = open.start + 9;
          const content = text.slice(contentStart);
          console.log(`Extracted content: "${content}"`);
          result += content;
        }
      }
    }
    console.log("Final result:", result);
    return result;
  }

  console.log("No unclosed tags found");
  return text;
}

// 测试
const testText = "Before ĐthinkingUnclosed thinking content";
const result = testPreserveMode(testText);
console.log('Expected: "Unclosed thinking content"');
console.log("Match:", result === "Unclosed thinking content");
