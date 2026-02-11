// Test the plainClosingTagRe regex

const plainClosingTagRe = /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;

// Create test strings with HTML tags
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "</think>"

const test1 = "Before This is thinking" + thinkingCloseTag + " after.";
const test2 =
  "Start First thought" + thinkingCloseTag + " middle Second thought" + thinkingCloseTag + " end.";

console.log("Test 1:", test1);
console.log("plainClosingTagRe matches:", [...test1.matchAll(plainClosingTagRe)]);

console.log("\nTest 2:", test2);
console.log("plainClosingTagRe matches:", [...test2.matchAll(plainClosingTagRe)]);

// Test what happens with different patterns
const test3 = "word" + thinkingCloseTag;
const test4 = "some word" + thinkingCloseTag;
const test5 = "some words here" + thinkingCloseTag;

console.log("\nTest 3:", test3);
console.log("plainClosingTagRe matches:", [...test3.matchAll(plainClosingTagRe)]);

console.log("\nTest 4:", test4);
console.log("plainClosingTagRe matches:", [...test4.matchAll(plainClosingTagRe)]);

console.log("\nTest 5:", test5);
console.log("plainClosingTagRe matches:", [...test5.matchAll(plainClosingTagRe)]);

// Test negative lookbehind behavior
console.log("\nTesting negative lookbehind:");
const test6 = thinkingCloseTag + " start";
console.log("Test 6:", test6);
console.log("plainClosingTagRe matches:", [...test6.matchAll(plainClosingTagRe)]);
