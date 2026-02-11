import fs from "fs";

// 读取测试文件内容
const content = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
console.log("Raw content:");
console.log(content);

// 查找特殊字符
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("thinking") || line.includes("thought")) {
    console.log(`\nLine ${i + 1}: ${line}`);
    // 查找特殊字符
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const code = char.charCodeAt(0);
      if (code > 127) {
        console.log(`  Special char at position ${j}: "${char}" (code: ${code})`);
      }
    }
  }
}
