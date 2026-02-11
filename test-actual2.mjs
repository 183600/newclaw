import fs from "fs";

// 读取测试文件内容
const content = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// 查找所有包含 thinking 或 thought 的行
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // 查找包含 thinking 或 thought 的行
  if (line.includes("thinking") || line.includes("thought")) {
    console.log(`\nLine ${i + 1}: ${line}`);

    // 查找字符串字面量
    const match = line.match(/"([^"]*)"/);
    if (match) {
      const text = match[1];
      console.log("  Text:", text);

      // 显示特殊字符
      for (let j = 0; j < text.length; j++) {
        const char = text[j];
        const code = char.charCodeAt(0);
        if (code > 127 || char === "<" || char === ">") {
          console.log(`    Position ${j}: "${char}" (code: ${code}, hex: 0x${code.toString(16)})`);
        }
      }
    }
  }
}
