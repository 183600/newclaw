// Let's read the test file as bytes to see if there are special characters
import { readFileSync } from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

console.log("=== Reading test file as bytes ===\n");

const testFile = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the test section
const testStart = testFile.indexOf("should preserve content within code blocks");
const testSection = testFile.substring(testStart, testStart + 1000);

// Look for the specific test
const testMatch = testSection.match(/const text = \`([^\`]+)\`;/);
if (testMatch) {
  const testString = testMatch[1];
  console.log("Test string (raw):");
  console.log(testString);

  console.log("\nTest string (JSON):");
  console.log(JSON.stringify(testString));

  // Check character by character
  console.log("\nCharacter codes:");
  for (let i = 0; i < Math.min(testString.length, 200); i++) {
    const char = testString[i];
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) {
      // Non-ASCII character
      console.log(`Position ${i}: "${char}" (code: ${code}) - 0x${code.toString(16)}`);
    }
  }

  // Let's also check what happens when we use this string in a template literal
  console.log("\n=== Using as template literal ===");
  const templateResult = eval("`" + testString + "`");
  console.log("Template result:", JSON.stringify(templateResult));

  // Now run the function
  const result = stripReasoningTagsFromText(templateResult);
  console.log("Function result:", JSON.stringify(result));

  console.log("\n=== Analysis ===");
  console.log('If the result contains "This should be removed", then:');
  console.log("1. The test string has special characters");
  console.log("2. The function is not removing them correctly");
  console.log("3. The test expectations are wrong");
}
