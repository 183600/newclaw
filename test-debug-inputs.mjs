// Let's debug the actual test cases
import fs from "fs";

const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find all test cases
const testCases = [];

// Test 1: Code blocks
const test1Match = testFile.match(
  /should preserve content within code blocks[\s\S]*?const text = `([^`]+)`;/,
);
if (test1Match) {
  testCases.push({
    name: "Code blocks",
    text: test1Match[1],
  });
}

// Test 2: Inline code
const test2Match = testFile.match(
  /should handle inline code preservation[\s\S]*?const text = "([^"]+)";/,
);
if (test2Match) {
  testCases.push({
    name: "Inline code",
    text: test2Match[1],
  });
}

// Test 3: Unclosed thinking tags - preserve mode
const test3Match = testFile.match(
  /should preserve unclosed thinking tags in preserve mode[\s\S]*?const text = "([^"]+)";/,
);
if (test3Match) {
  testCases.push({
    name: "Unclosed thinking - preserve",
    text: test3Match[1],
  });
}

// Test 4: Unclosed thinking tags - strict mode
const test4Match = testFile.match(
  /should remove unclosed thinking tags in strict mode[\s\S]*?const text = "([^"]+)";/,
);
if (test4Match) {
  testCases.push({
    name: "Unclosed thinking - strict",
    text: test4Match[1],
  });
}

// Test 5: Trim options
const test5Match = testFile.match(/should respect trim options[\s\S]*?const text = "([^"]+)";/);
if (test5Match) {
  testCases.push({
    name: "Trim options",
    text: test5Match[1],
  });
}

// Print all test cases
for (const testCase of testCases) {
  console.log(`\n=== ${testCase.name} ===`);
  console.log("Text:", JSON.stringify(testCase.text));

  // Check for special characters
  const hasSpecialChars = /\u0111|\u0110/.test(testCase.text);
  console.log("Has special characters:", hasSpecialChars);

  if (hasSpecialChars) {
    console.log("Special characters found:");
    for (let i = 0; i < testCase.text.length; i++) {
      const char = testCase.text[i];
      const code = char.charCodeAt(0);
      if (code === 0x0111 || code === 0x0110) {
        const start = Math.max(0, i - 10);
        const end = Math.min(testCase.text.length, i + 10);
        console.log(
          `  Position ${i}: "${char}" (code: ${code}) in "${testCase.text.substring(start, end)}"`,
        );
      }
    }
  }
}
