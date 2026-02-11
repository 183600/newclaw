// Test the regex patterns
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

console.log("=== Testing QUICK_TAG_RE ===");

const test1 = "Before \u0110thinking Unclosed thinking content";
console.log(`Test 1: ${JSON.stringify(test1)}`);
console.log(`Matches: ${QUICK_TAG_RE.test(test1)}`);

const test2 = "First thought\u0111 middle";
console.log(`\nTest 2: ${JSON.stringify(test2)}`);
console.log(`Matches: ${QUICK_TAG_RE.test(test2)}`);

const test3 = "Text with \`inline code\u0111\` and outside thinking\u0111.";
console.log(`\nTest 3: ${JSON.stringify(test3)}`);
console.log(`Matches: ${QUICK_TAG_RE.test(test3)}`);

// Test individual parts
console.log("\n=== Testing individual patterns ===");
const pattern1 = /(?:thinking|thought|antthinking)[đĐ]/i;
console.log(`Pattern1 on "thought\u0111": ${pattern1.test("thought\u0111")}`);
console.log(`Pattern1 on "\u0110thinking": ${pattern1.test("\u0110thinking")}`);

const pattern2 = /(?:Đ)(?:thinking|thought|antthinking)/i;
console.log(`Pattern2 on "thought\u0111": ${pattern2.test("thought\u0111")}`);
console.log(`Pattern2 on "\u0110thinking": ${pattern2.test("\u0110thinking")}`);

// Test the actual function logic
console.log("\n=== Testing function logic ===");
function testQuickTag(text) {
  if (!text) {
    return text;
  }
  if (!QUICK_TAG_RE.test(text)) {
    return text;
  }
  return "Would process tags";
}

console.log(`Function result for test1: ${JSON.stringify(testQuickTag(test1))}`);
console.log(`Function result for test2: ${JSON.stringify(testQuickTag(test2))}`);
console.log(`Function result for test3: ${JSON.stringify(testQuickTag(test3))}`);
