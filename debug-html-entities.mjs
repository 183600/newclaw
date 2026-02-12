// 测试 HTML 实体转换
function testHtmlEntities(text) {
  console.log("Original text:", text);

  // Convert HTML entities to special characters for processing
  let cleaned = text;
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

  console.log("After HTML entity conversion:", cleaned);
  return cleaned;
}

// 测试实际的测试用例
const test1 = "Before This is thinking&#x111; after.";
const result1 = testHtmlEntities(test1);

const test2 = "Text with `inline code&#x110;thinking` and outside thinking&#x111;.";
const result2 = testHtmlEntities(test2);
