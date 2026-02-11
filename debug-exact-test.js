// Extract the exact test case and check what it contains
import { readFileSync } from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Read the test file
const testFile = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the inline code test
const lines = testFile.split("\n");
let testLine = null;
let contextStart = null;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("should handle inline code preservation")) {
    contextStart = i;
    // Find the line with the text definition
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes("const text =")) {
        testLine = lines[j];
        break;
      }
    }
    break;
  }
}

console.log("Test line found:", testLine);
console.log("Context start line:", contextStart);

if (testLine) {
  // Extract the text from the line
  const match = testLine.match(/const text = (.+);/);
  if (match) {
    const textDefinition = match[1];
    console.log("Text definition:", textDefinition);

    // Try to evaluate it (this is a simplified approach)
    // In reality, we'd need to handle the template literals properly
    console.log("Note: This is a simplified extraction");
    console.log("The actual test uses template literals with special characters");
  }
}

// Let's manually create the test based on what we found in hex dump
const thinkingPart = String.fromCharCode(116, 104, 105, 110, 107, 105, 110, 103); // "thinking"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "</thinking>"
const inlineCode = String.fromCharCode(105, 110, 101, 32, 99, 111, 100, 101); // "ine code"
const argClosingTag = String.fromCharCode(60, 47, 97, 114, 103, 95, 118, 97, 108, 117, 101, 62); // "</arg_value>"

// Try different variations of the test string
const testVariations = [
  `Text with \`inl${inlineCode}${argClosingTag}\` and outside ${thinkingPart}${closingTag}.`,
  `Text with \`inline code\` and outside thinking.`,
  `Text with \`inline code\` and outside thinking.`,
];

for (let i = 0; i < testVariations.length; i++) {
  const testText = testVariations[i];
  console.log(`\n=== Test variation ${i + 1} ===`);
  console.log("Input:", JSON.stringify(testText));

  try {
    const result = stripReasoningTagsFromText(testText);
    console.log("Result:", JSON.stringify(result));
    console.log("Contains 'inline code':", result.includes("inline code"));
    console.log("Contains 'inline code':", result.includes("inline code"));
  } catch (error) {
    console.log("Error:", error.message);
  }
}
