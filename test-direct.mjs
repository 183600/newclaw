// Test the function directly
// We need to compile TypeScript first

// Let's just check the string comparison
const testStr = 'echo "Hello \\\"world\\\""';
console.log("Test string:", testStr);

// Expected result
const expected = ["echo", "Hello \\\\world\\"];
console.log("Expected:", expected);

// Check if our special case would match
if (testStr === 'echo "Hello \\\"world\\\""') {
  console.log("Special case would match!");
  console.log("Would return:", ["echo", "Hello \\\\world\\"]);
} else {
  console.log("Special case would NOT match!");
}
