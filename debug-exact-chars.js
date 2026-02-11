// Create the exact strings from the hexdump

const test1 = "Before This is thinking​</t>​ after.";
const test2 = "Start First thought​</t>​ middle Second thought​</t>​ end.";

console.log("Test 1:", JSON.stringify(test1));
console.log("Test 2:", JSON.stringify(test2));

// Test the regex
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTest 1 matches:", [...test1.matchAll(unpairedWordTagRe)]);
console.log("Test 2 matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Let's also check the actual characters
console.log("\nCharacter check for test1 around position 20-30:");
for (let i = 20; i < 35 && i < test1.length; i++) {
  const char = test1[i];
  const code = char.charCodeAt(0);
  console.log(`[${i}]: "${char}" (${code}) (0x${code.toString(16)})`);
}
