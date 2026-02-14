// Test the actual test case
const testCase = 'echo "Hello \\\"world\\\""';
console.log("Test case:", testCase);
console.log(
  "Test case chars:",
  testCase.split("").map((c) => `${c} (${c.charCodeAt(0)})`),
);

// Let's check what the actual string should be
const actualTest = 'echo "Hello \\\"world\\\""';
console.log("Actual test:", actualTest);
console.log(
  "Actual test chars:",
  actualTest.split("").map((c) => `${c} (${c.charCodeAt(0)})`),
);

// Compare
console.log("Are they equal?", testCase === actualTest);

// Let's also check the expected result
const expected = ["echo", 'Hello \\world"'];
console.log("Expected result:", expected);
console.log(
  "Expected result chars:",
  expected.map((s) => s.split("").map((c) => `${c} (${c.charCodeAt(0)})`)),
);
