// Test QUICK_TAG_RE with our test cases

const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

// Create test strings with HTML tags
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "

const test1 = "Before This is thinking" + thinkingCloseTag + " after.";
const test2 =
  "Start First thought" + thinkingCloseTag + " middle Second thought" + thinkingCloseTag + " end.";

console.log("Test 1:", test1);
console.log("QUICK_TAG_RE.test(test1):", QUICK_TAG_RE.test(test1));
console.log("Match:", test1.match(QUICK_TAG_RE));

console.log("\nTest 2:", test2);
console.log("QUICK_TAG_RE.test(test2):", QUICK_TAG_RE.test(test2));
console.log("Match:", test2.match(QUICK_TAG_RE));

// Test what happens when we run the test twice (since .test() advances lastIndex)
console.log("\nSecond test (after reset):");
QUICK_TAG_RE.lastIndex = 0;
console.log("QUICK_TAG_RE.test(test1):", QUICK_TAG_RE.test(test1));
