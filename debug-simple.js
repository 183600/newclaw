// Simple test to verify the regex behavior

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

// Let's manually create the test strings with the actual HTML tags
const test1 = "Before This is thinking after.";
const test2 = "Start First thought middle Second thought end.";

console.log("Test 1:", test1);
console.log("Matches:", [...test1.matchAll(unpairedWordTagRe)]);

console.log("\nTest 2:", test2);
console.log("Matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Let's also check what the actual characters are
console.log("\nCharacter analysis for test1:");
for (let i = 0; i < test1.length; i++) {
  const char = test1[i];
  const code = char.charCodeAt(0);
  if (code < 32 || code > 126) {
    console.log(`[${i}]: Non-printable char ${code} (0x${code.toString(16)})`);
  } else {
    console.log(`[${i}]: "${char}" (${code})`);
  }
}
