// Debug script to check actual characters in test file
import fs from "fs";

const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the test with code blocks
const codeBlockTestStart = testContent.indexOf("should preserve content within code blocks");
const codeBlockTestEnd = testContent.indexOf("}", codeBlockTestStart + 500);
const testSection = testContent.slice(codeBlockTestStart, codeBlockTestEnd);

console.log("=== Test section ===");
console.log(testSection);

// Extract the text variable
const textMatch = testSection.match(/const text = `([^`]+)`/s);
if (textMatch) {
  const text = textMatch[1];
  console.log("\n=== Extracted text ===");
  console.log(text);

  // Find the special characters
  const preservedIndex = text.indexOf("This should be preserved");
  const removedIndex = text.indexOf("This should be removed");

  if (preservedIndex !== -1) {
    const preservedEnd = text.indexOf("\n", preservedIndex);
    const preservedLine = text.slice(preservedIndex, preservedEnd);
    console.log("\n=== Preserved line ===");
    console.log(preservedLine);
    console.log(
      "Char codes:",
      [...preservedLine].map((c) => `${c} (${c.charCodeAt(0)})`),
    );
  }

  if (removedIndex !== -1) {
    const removedEnd = text.indexOf(" ", removedIndex);
    const removedLine = text.slice(removedIndex, removedEnd);
    console.log("\n=== Removed line ===");
    console.log(removedLine);
    console.log(
      "Char codes:",
      [...removedLine].map((c) => `${c} (${c.charCodeAt(0)})`),
    );
  }
}
