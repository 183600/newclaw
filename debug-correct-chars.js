// Test with the exact strings from the test file

// From hexdump: 74 68 69 6e 6b 69 6e 67 3c 2f 74 68 69 6e 6b 3e = " thinking</thi"
const test1 = "Before This is thinking after.";
const test2 = "Start First thought middle Second thought end.";

console.log("Test 1:", test1);
console.log("Test 2:", test2);

// Test the regex
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTest 1 matches:", [...test1.matchAll(unpairedWordTagRe)]);
console.log("Test 2 matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Check character by character
console.log("\nCharacter analysis for test1 around the tag:");
for (let i = 15; i < 35 && i < test1.length; i++) {
  const char = test1[i];
  const code = char.charCodeAt(0);
  const hex = code.toString(16);
  console.log(`[${i}]: "${char}" (${code}) (0x${hex})`);
}
