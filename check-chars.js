// 检查特殊字符
import fs from "fs";
const content = fs.readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = content.split("\n");

// 检查特定行
const line39 = lines[38]; // inline code test
console.log("Line 39:", line39);

// 查找所有字符，寻找特殊字符
for (let j = 0; j < line39.length; j++) {
  const char = line39[j];
  const code = char.charCodeAt(0);

  if (code > 127) {
    console.log("  Special at position " + j + ": code=" + code + ", hex=0x" + code.toString(16));
  }
}

// 检查第17行（multiple thinking blocks）
const line17 = lines[16];
console.log("\nLine 17:", line17);
for (let j = 0; j < line17.length; j++) {
  const char = line17[j];
  const code = char.charCodeAt(0);

  if (code > 127) {
    console.log("  Special at position " + j + ": code=" + code + ", hex=0x" + code.toString(16));
  }
}

// 检查第46行（preserve mode）
const line46 = lines[45];
console.log("\nLine 46:", line46);
for (let j = 0; j < line46.length; j++) {
  const char = line46[j];
  const code = char.charCodeAt(0);

  if (code > 127) {
    console.log("  Special at position " + j + ": code=" + code + ", hex=0x" + code.toString(16));
  }
}
