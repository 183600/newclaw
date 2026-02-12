// Check the correct substring range
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";

console.log("Checking condition at position 53:");
console.log("i + 8 < length:", 53 + 8 < overlappingText.length);
console.log("substring(53, 61):", overlappingText.substring(53, 61));
console.log("substring(53, 62):", overlappingText.substring(53, 62));
console.log("Expected: thinking\u0111");
console.log("Match with 61:", overlappingText.substring(53, 61) === "thinking\u0111");
console.log("Match with 62:", overlappingText.substring(53, 62) === "thinking\u0111");

// The issue is that our condition is checking i+7 but we need i+8 for thinkingđ
console.log('\nFor thinkingđ, we need 8 characters (7 for "thinking" + 1 for "đ")');
console.log(
  'So the condition should be i + 8 < length and substring(i, i + 8) === "thinking\u0111"',
);
