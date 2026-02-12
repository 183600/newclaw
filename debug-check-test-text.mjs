// Check if the test file actually contains special characters
import fs from "fs";

// Read the test file
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the test cases
const codeBlockTestStart = testContent.indexOf("should preserve content within code blocks");
const codeBlockTestEnd = testContent.indexOf("});", codeBlockTestStart) + 3;
const codeBlockTest = testContent.slice(codeBlockTestStart, codeBlockTestEnd);

console.log("=== Code block test ===");
console.log(codeBlockTest);

// Check for special characters in the text
const textMatch = codeBlockTest.match(/const text = `([^`]+)`;/);
if (textMatch) {
  const testText = textMatch[1];
  console.log("\nTest text:");
  console.log(JSON.stringify(testText));
  console.log("Contains đ:", testText.includes("đ"));
  console.log(
    "Character codes:",
    Array.from(testText).map((c) => `${c} (${c.charCodeAt(0)})`),
  );
}

const inlineCodeTestStart = testContent.indexOf("should handle inline code preservation");
const inlineCodeTestEnd = testContent.indexOf("});", inlineCodeTestStart) + 3;
const inlineCodeTest = testContent.slice(inlineCodeTestStart, inlineCodeTestEnd);

console.log("\n=== Inline code test ===");
console.log(inlineCodeTest);

// Check for special characters in the text
const textMatch2 = inlineCodeTest.match(/const text = "([^"]+)";/);
if (textMatch2) {
  const testText = textMatch2[1];
  console.log("\nTest text:");
  console.log(JSON.stringify(testText));
  console.log("Contains đ:", testText.includes("đ"));
  console.log(
    "Character codes:",
    Array.from(testText).map((c) => `${c} (${c.charCodeAt(0)})`),
  );
}
