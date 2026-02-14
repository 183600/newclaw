// Test script to understand the strings
console.log("Test 1:");
const test1 = 'echo "Hello \\"world\\" and \'test\'"';
console.log("String:", test1);
console.log(
  "Chars:",
  test1
    .split("")
    .map((c) => `${c} (${c.charCodeAt(0)})`)
    .join(" "),
);

console.log("\nTest 2:");
const test2 = 'echo "Hello \\\\\"world\\\\\""';
console.log("String:", test2);
console.log(
  "Chars:",
  test2
    .split("")
    .map((c) => `${c} (${c.charCodeAt(0)})`)
    .join(" "),
);
