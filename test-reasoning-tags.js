const QUICK_TAG_RE = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>/i;

function testRegex() {
  // 使用十六进制编码创建正确的字符串
  const testText = Buffer.from(
    "4265666f72652054686973206973207468696e6b696e673c2f7468696e6b3e2061667465722e",
    "hex",
  ).toString("utf8");
  console.log("Test text:", testText);
  console.log("QUICK_TAG_RE test:", QUICK_TAG_RE.test(testText));

  const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
  console.log("THINKING_TAG_RE matches:", [...testText.matchAll(THINKING_TAG_RE)]);

  // 检查十六进制
  console.log("Hex:", Buffer.from(testText).toString("hex"));
}

testRegex();
