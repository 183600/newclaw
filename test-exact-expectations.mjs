// Let's check the exact test expectations
import fs from "fs";

const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Extract the exact test strings and expectations
const tests = [];

// Test 1
const test1Match = testFile.match(
  /should preserve content within code blocks[\s\S]*?const text = `([^`]+)`;[\s\S]*?expect\(result\)\.toContain\("([^"]+)"\);[\s\S]*?expect\(result\)\.not\.toContain\("([^"]+)"\);/,
);
if (test1Match) {
  tests.push({
    name: "Test 1: Code blocks",
    text: test1Match[1],
    expectContains: test1Match[2],
    expectNotContains: test1Match[3],
  });
}

// Test 2
const test2Match = testFile.match(
  /should handle inline code preservation[\s\S]*?const text = "([^"]+)";[\s\S]*?expect\(result\)\.toContain\("([^"]+)"\);[\s\S]*?expect\(result\)\.not\.toContain\("([^"]+)"\);/,
);
if (test2Match) {
  tests.push({
    name: "Test 2: Inline code",
    text: test2Match[1],
    expectContains: test2Match[2],
    expectNotContains: test2Match[3],
  });
}

// Test 3
const test3Match = testFile.match(
  /should preserve unclosed thinking tags in preserve mode[\s\S]*?const text = "([^"]+)";[\s\S]*?expect\(result\)\.toBe\("([^"]+)"\);/,
);
if (test3Match) {
  tests.push({
    name: "Test 3: Unclosed thinking - preserve",
    text: test3Match[1],
    expectToBe: test3Match[2],
  });
}

// Test 4
const test4Match = testFile.match(
  /should remove unclosed thinking tags in strict mode[\s\S]*?const text = "([^"]+)";[\s\S]*?expect\(result\)\.toBe\("([^"]+)"\);/,
);
if (test4Match) {
  tests.push({
    name: "Test 4: Unclosed thinking - strict",
    text: test4Match[1],
    expectToBe: test4Match[2],
  });
}

// Test 5
const test5Match = testFile.match(
  /should respect trim options[\s\S]*?const text = "([^"]+)";[\s\S]*?expect\(resultNone\)\.toBe\("([^"]+)"\);/,
);
if (test5Match) {
  tests.push({
    name: "Test 5: Trim options",
    text: test5Match[1],
    expectToBe: test5Match[2],
  });
}

// Print the exact test strings
for (const test of tests) {
  console.log(`\n=== ${test.name} ===`);
  console.log("Text:", JSON.stringify(test.text));
  if (test.expectContains) {
    console.log("Expect contains:", JSON.stringify(test.expectContains));
    console.log("Has special char in expect:", /\u0111|\u0110/.test(test.expectContains));
  }
  if (test.expectNotContains) {
    console.log("Expect not contains:", JSON.stringify(test.expectNotContains));
    console.log("Has special char in expect:", /\u0111|\u0110/.test(test.expectNotContains));
  }
  if (test.expectToBe) {
    console.log("Expect to be:", JSON.stringify(test.expectToBe));
    console.log("Has special char in expect:", /\u0111|\u0110/.test(test.expectToBe));
  }
}
