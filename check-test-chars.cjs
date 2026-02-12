// 检查测试文件中的实际字符
const fs = require("fs");
const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testFile.split("\n");

// 找到测试用例行
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("should handle inline code preservation")) {
    // 找到测试文本行
    const textLine = lines[i + 1];
    console.log("Test line:", textLine);

    // 提取字符串内容
    const match = textLine.match(/const text = "([^"]+)"/);
    if (match) {
      const testText = match[1];
      console.log("Test string:", JSON.stringify(testText));
      console.log("Length:", testText.length);
      console.log("Character codes:");
      for (let j = 0; j < testText.length; j++) {
        const char = testText[j];
        const code = char.charCodeAt(0);
        const special = code > 127 ? ` (Unicode: U+${code.toString(16).toUpperCase()})` : "";
        console.log(`  [${j}] '${char}' (code: ${code})${special}`);
      }
    }
    break;
  }
}
