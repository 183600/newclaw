// Let's check the exact test case from the file
import fs from "fs";

const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the test case
const testStart = testFile.indexOf("should preserve content within code blocks");
const testContent = testFile.substring(testStart, testStart + 1000);

console.log("Test content:");
console.log(testContent);

// Extract the actual test string
const textMatch = testContent.match(/const text = `([^`]+)`;/);
if (textMatch) {
  const text = textMatch[1];
  console.log("\nActual test string:");
  console.log(JSON.stringify(text));

  // Check for special characters
  console.log("\nSpecial characters in string:");
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if (code === 0x0111 || code === 0x0110) {
      console.log(`Position ${i}: "${char}" (code: ${code})`);
      // Show context
      const start = Math.max(0, i - 10);
      const end = Math.min(text.length, i + 10);
      console.log(`  Context: "${text.substring(start, end)}"`);
    }
  }
}
