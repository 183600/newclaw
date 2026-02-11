import fs from "fs";

// 读取测试文件内容
const content = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// 查找包含特殊字符的行
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // 查找包含 thinking 或 thought 的行
  if (line.includes("thinking") || line.includes("thought")) {
    console.log(`\nLine ${i + 1}: ${line}`);

    // 分析每个字符
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const code = char.charCodeAt(0);

      // 查找特殊字符（非ASCII）
      if (code > 127) {
        console.log(`  Position ${j}: "${char}" (code: ${code}, hex: 0x${code.toString(16)})`);
      }

      // 查找 thinking 或 thought 后面的字符
      if (
        (line.substring(j, j + 8) === "thinking" || line.substring(j, j + 6) === "thought") &&
        j > 0
      ) {
        const nextChar = line[j + (line.substring(j, j + 8) === "thinking" ? 8 : 6)];
        if (nextChar && nextChar.charCodeAt(0) > 127) {
          console.log(
            `  Special char after ${line.substring(j, j + 8) === "thinking" ? "thinking" : "thought"}: "${nextChar}" (code: ${nextChar.charCodeAt(0)}, hex: 0x${nextChar.charCodeAt(0).toString(16)})`,
          );
        }
      }
    }
  }
}
