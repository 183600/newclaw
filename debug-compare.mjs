// Compare the expected and actual strings
const expected = "inline code\u0111";
const actual = "inline code\u0111";

console.log("Expected:", JSON.stringify(expected));
console.log("Actual:", JSON.stringify(actual));
console.log("Equal:", expected === actual);
console.log("Expected length:", expected.length);
console.log("Actual length:", actual.length);

for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
  if (expected[i] !== actual[i]) {
    console.log(`Difference at position ${i}:`);
    console.log(`  Expected: ${JSON.stringify(expected[i])} (${expected.charCodeAt(i)})`);
    console.log(`  Actual: ${JSON.stringify(actual[i])} (${actual.charCodeAt(i)})`);
  }
}
