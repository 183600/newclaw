// Use the exact strings with HTML tags
const test1 = "Before This is thinking after.";
const test2 = "Start First thought middle Second thought end.";

console.log("Test 1:", JSON.stringify(test1));
console.log("Test 2:", JSON.stringify(test2));

// Test the regex
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTest 1 matches:", [...test1.matchAll(unpairedWordTagRe)]);
console.log("Test 2 matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Character analysis around the HTML tags
console.log("\nCharacter analysis for test1 around position 22-32:");
for (let i = 22; i < 32 && i < test1.length; i++) {
  const char = test1[i];
  const code = char.charCodeAt(0);
  const hex = code.toString(16);
  console.log(`[${i}]: "${char}" (${code}) (0x${hex})`);
}
