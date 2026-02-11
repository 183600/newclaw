// Test the regex patterns
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]/i;

const test = "Before This is thinkingđ after.";
console.log("Input:", test);
console.log("Matches QUICK_TAG_RE:", QUICK_TAG_RE.test(test));

// Test individual parts
const part1 = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>/i;
const part2 = /(?:thinking|thought|antthinking)[\u0111\u0110]/i;

console.log("Matches part1 (HTML):", part1.test(test));
console.log("Matches part2 (special):", part2.test(test));

// Test the special char pattern
const test2 = "thinkingđ";
console.log("\nTest2:", test2);
console.log("Matches part2:", part2.test(test2));

// Test with đ
const test3 = "thinkingđ";
console.log("\nTest3:", test3);
console.log("Matches part2:", part2.test(test3));

// Test character codes
console.log("\nCharacter codes:");
console.log("đ:", "đ".charCodeAt(0));
console.log("\u0111:", "\u0111".charCodeAt(0));
console.log("Are they equal?", "đ" === "\u0111");
