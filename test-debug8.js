const text = "Before This is thinking</thinking> after.";
const text2 = "Before This is thinkingđĐ after.";

const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)/i;

console.log("Text 1:", text);
console.log("QUICK_TAG_RE matches 1:", QUICK_TAG_RE.test(text));
console.log("Match 1:", text.match(QUICK_TAG_RE));

console.log("\nText 2:", text2);
console.log("QUICK_TAG_RE matches 2:", QUICK_TAG_RE.test(text2));
console.log("Match 2:", text2.match(QUICK_TAG_RE));

// Test specific pattern for short tags
const shortTagRe = /<\s*\/\s*(?:think|thinking|thought|antthinking)\b[^>]*>/gi;
console.log("\nShort tag regex for text 2:", shortTagRe.test(text2));
console.log("Short tag match 2:", text2.match(shortTagRe));
