// 手动检查测试字符串中的字符
const testString = "Before This is thinking\u0111 after.";
console.log("Test string:", testString);
console.log("Length:", testString.length);

for (let i = 0; i < testString.length; i++) {
  const char = testString[i];
  const code = char.charCodeAt(0);
  console.log(`Position ${i}: "${char}" (code: ${code})`);
}

// 检查实际的测试文件
import fs from "fs";
const content = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// 提取第12行的内容
const lines = content.split("\n");
const line12 = lines[11]; // 数组是从0开始的
console.log("\nLine 12 from file:", line12);
console.log("Length:", line12.length);

for (let i = 0; i < line12.length; i++) {
  const char = line12[i];
  const code = char.charCodeAt(0);
  if (code > 127 || char === '"') {
    console.log(`Position ${i}: "${char}" (code: ${code})`);
  }
}
