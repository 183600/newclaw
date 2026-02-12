// Debug script to read the actual test file content
import { readFileSync } from "fs";

const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the specific test line
const lines = testContent.split("\n");
const testLineIndex = lines.findIndex((line) =>
  line.includes('const text = "Before This is thinking'),
);

if (testLineIndex !== -1) {
  const testLine = lines[testLineIndex];
  console.log("Found test line:", testLine);

  // Extract the text using regex
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Extracted text:", JSON.stringify(testText));
    console.log("Length:", testText.length);

    // Show all character codes
    console.log("\nAll character codes:");
    for (let i = 0; i < testText.length; i++) {
      const char = testText[i];
      const code = char.charCodeAt(0);
      const hex = code.toString(16);
      const printable = code >= 32 && code <= 126 ? char : `[${code}]`;
      console.log(`Position ${i}: ${printable} -> ${code} (0x${hex})`);
    }
  }
}
