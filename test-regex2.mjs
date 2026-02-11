// Test the regex patterns
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;

const test = "Before This is thinking\u0111 after.";
console.log("Input:", test);
console.log("Matches QUICK_TAG_RE:", QUICK_TAG_RE.test(test));

// Test individual parts
const part1 = /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>/i;
const part2 = /(?:thinking|thought|antthinking)[\u0111\u0110]/i;
const part3 = /(?:\u0110)(?:thinking|thought|antthinking)/i;

console.log("Matches part1 (HTML):", part1.test(test));
console.log("Matches part2 (special-end):", part2.test(test));
console.log("Matches part3 (special-start):", part3.test(test));

// Test with actual character
const test2 = "thinking\u0111";
console.log("\nTest2:", test2);
console.log("Matches part2:", part2.test(test2));

// Check character codes
console.log("\nCharacter codes:");
console.log("đ:", "đ".charCodeAt(0));
console.log("\u0111:", "\u0111".charCodeAt(0));
console.log("Are they equal?", "đ" === "\u0111");
