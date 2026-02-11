// Create strings using fromCharCode to ensure exact characters
const thinkingCloseTag = String.fromCharCode(0x3c, 0x2f, 0x74, 0x68, 0x69, 0x6e, 0x6b, 0x3e); // "

const test1 = "Before This is thinking" + thinkingCloseTag + " after.";
const test2 =
  "Start First thought" + thinkingCloseTag + " middle Second thought" + thinkingCloseTag + " end.";

console.log("Test 1:", JSON.stringify(test1));
console.log("Test 2:", JSON.stringify(test2));

// Verify the HTML tag was created correctly
console.log("\nHTML tag:", JSON.stringify(thinkingCloseTag));
console.log("HTML tag length:", thinkingCloseTag.length);

// Test the regex
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTest 1 matches:", [...test1.matchAll(unpairedWordTagRe)]);
console.log("Test 2 matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Test what the regex should match
console.log('\n"thinking" matches:', "thinking".match(unpairedWordTagRe));
console.log('"thinking" matches:', "thinking".match(unpairedWordTagRe));
