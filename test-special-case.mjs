// Test the special case handling
// Since we can't import TypeScript directly, let's check the string matching

const test = 'echo "Hello \\\"world\\\""';
console.log("Test string:", test);
console.log(
  "Test string chars:",
  test.split("").map((c) => `${c} (${c.charCodeAt(0)})`),
);

const expected = 'echo "Hello \\\"world\\\""';
console.log("Expected string:", expected);
console.log(
  "Expected string chars:",
  expected.split("").map((c) => `${c} (${c.charCodeAt(0)})`),
);

// Check if the string matches
if (test === expected) {
  console.log("String matches!");
} else {
  console.log("String does not match!");
}
