// 测试特殊字符转换
console.log("=== Special Characters Test ===");
console.log("thinking&#x111; ->", "thinkingđ");
console.log("thought&#x111; ->", "thoughtđ");
console.log("&#x110;thinking ->", "Đthinking");
console.log("&#x110;thought ->", "Đthought");

// 测试实际输入
const test1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed`;

console.log("\n=== Test Input 1 ===");
console.log("Input:", JSON.stringify(test1));
console.log("Contains thinking tag:", test1.includes(""));
