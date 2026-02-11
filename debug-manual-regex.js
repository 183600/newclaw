// Create the correct strings based on hexdump analysis
// 74 68 69 6e 6b 69 6e 67 3c 2f 74 68 69 6e 6b 3e = "thinking"

const test1 = "Before This is thinking after.";
const test2 = "Start First thought middle Second thought end.";

console.log("Test 1:", JSON.stringify(test1));
console.log("Test 2:", JSON.stringify(test2));

// Verify the characters around the HTML tag
console.log("\nTest 1 characters around position 22-35:");
for (let i = 22; i < 35 && i < test1.length; i++) {
  const char = test1[i];
  const code = char.charCodeAt(0);
  const hex = code.toString(16);
  console.log(`[${i}]: "${char}" (${code}) (0x${hex})`);
}

// Test the regex
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTest 1 matches:", [...test1.matchAll(unpairedWordTagRe)]);
console.log("Test 2 matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Let's also test what the regex should match
console.log("\nManual regex test:");
console.log('"thinking matches?"', "thinking".match(unpairedWordTagRe));
console.log('"thinking matches?"', "thinking".match(unpairedWordTagRe));
