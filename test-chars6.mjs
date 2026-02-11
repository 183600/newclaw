import fs from "fs";

// 读取测试文件内容
const content = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// 提取第12行的内容
const lines = content.split("\n");
const line12 = lines[11]; // 数组是从0开始的
console.log("Line 12 from file:", line12);

// 提取字符串内容
const match = line12.match(/"([^"]*)"/);
if (match) {
  const text = match[1];
  console.log("Extracted text:", text);
  console.log("Length:", text.length);

  // 显示所有字符及其编码
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    console.log(`Position ${i}: "${char}" (code: ${code}, hex: 0x${code.toString(16)})`);
  }
}
