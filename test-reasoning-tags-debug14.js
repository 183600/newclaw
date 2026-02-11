import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with the actual content from the test file
const text1 = "Before This is thinking\u0111 after.";
console.log("Test 1 input:", JSON.stringify(text1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Check what the actual test file contains
import fs from "fs";
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the test line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Before This is thinking")) {
    console.log("Raw line:", JSON.stringify(lines[i]));

    // Extract the text
    const match = lines[i].match(/const text = "([^"]+)";/);
    if (match) {
      console.log("Extracted text:", JSON.stringify(match[1]));
      console.log("Actual output:", JSON.stringify(stripReasoningTagsFromText(match[1])));

      // Check if it contains the special character
      console.log("Contains special char đ:", match[1].includes("\u0111"));
      console.log("Contains special char Đ:", match[1].includes("\u0110"));

      // Print each character with its code
      for (let j = 0; j < match[1].length; j++) {
        if (match[1].charCodeAt(j) === 273 || match[1].charCodeAt(j) === 272) {
          console.log(
            `Found special char at position ${j}: '${match[1][j]}' (${match[1].charCodeAt(j)})`,
          );
          console.log(`Context: ${JSON.stringify(match[1].substring(Math.max(0, j - 5), j + 5))}`);
        }
      }
    }
  }
}
