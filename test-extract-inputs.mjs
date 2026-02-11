// Let's check if the test inputs actually have special characters
import { readFileSync } from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Read the test file
const testFile = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Extract the test inputs
console.log("=== Extracting test inputs ===\n");

// Test 2
const test2Match = testFile.match(
  /should handle inline code preservation[\s\S]*?const text = "([^"]+)";/,
);
if (test2Match) {
  const test2 = test2Match[1];
  console.log("Test 2 input from file:");
  console.log(JSON.stringify(test2));

  // Check for special characters
  console.log("Has đ:", test2.includes(""));
  console.log("Has Đ:", test2.includes("Đ"));

  // Check the actual bytes
  console.log('\nCharacter codes for "inline code":');
  for (let i = 0; i < "inline code".length; i++) {
    const idx = test2.indexOf("inline code");
    if (idx !== -1) {
      for (let j = idx; j < idx + "inline code".length; j++) {
        const char = test2[j];
        const code = char.charCodeAt(0);
        console.log(`  Position ${j}: "${char}" code=${code} hex=0x${code.toString(16)}`);
      }
      break;
    }
  }

  // Check the actual bytes for "thinking"
  console.log('\nCharacter codes for "thinking":');
  const thinkingIdx = test2.indexOf("thinking");
  if (thinkingIdx !== -1) {
    for (let j = thinkingIdx; j < thinkingIdx + "thinking".length; j++) {
      const char = test2[j];
      const code = char.charCodeAt(0);
      console.log(`  Position ${j}: "${char}" code=${code} hex=0x${code.toString(16)}`);
    }
  }

  // Run the function
  const result2 = stripReasoningTagsFromText(test2);
  console.log("\nFunction result:");
  console.log(JSON.stringify(result2));

  console.log("\nAnalysis:");
  console.log("If the input has no special characters, the function will not modify it");
  console.log('The error message shows the result does not contain "thinking"');
  console.log("This suggests the input in the actual test has special characters");
  console.log("But the file we read does not");
}

console.log("\n=== Conclusion ===");
console.log("The test file we read does not have special characters");
console.log("But the actual test run must have them");
console.log("This could be due to:");
console.log("1. Test compilation/processing");
console.log("2. Different file encoding");
console.log("3. Runtime modification of test strings");
