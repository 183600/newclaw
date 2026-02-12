// 查看测试用例中的实际字符
const testString = "Text with `inline code`` and outside thinking``.";

console.log("Test string:", JSON.stringify(testString));
console.log("Length:", testString.length);
console.log("Character codes:");
for (let i = 0; i < testString.length; i++) {
  const char = testString[i];
  const code = char.charCodeAt(0);
  console.log(`  [${i}] '${char}' (code: ${code})`);
}

// 查找特殊字符
console.log("\nSpecial characters:");
console.log("`` positions:");
for (let i = 0; i < testString.length - 1; i++) {
  if (testString[i] === "`" && testString[i + 1] === "`") {
    console.log("  Found `` at position " + i);
  }
}
