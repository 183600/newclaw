import { readFileSync } from "fs";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find all test strings
const regex = /const text = "([^"]+)"/g;
let match;

console.log("=== All test strings with character codes ===\n");
let testIndex = 1;
while ((match = regex.exec(testContent)) !== null) {
  const text = match[1];
  console.log(`Test ${testIndex}:`);
  console.log(`  Raw: ${JSON.stringify(text)}`);

  // Print character codes for any special characters
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) {
      console.log(
        `  Position ${i}: Special character '${char}' -> ${code} (0x${code.toString(16)})`,
      );
    }
  }
  testIndex++;
}
