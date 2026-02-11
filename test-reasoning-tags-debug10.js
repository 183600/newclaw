import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with the actual content from the test file
const text1 = "Before This is <thinking>This is thinking</thinking> after.";
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

      // Check if it contains <thinking>
      console.log("Contains <thinking>:", match[1].includes("<thinking>"));
      console.log("Contains </thinking>:", match[1].includes("</thinking>"));

      // Print each character with its code
      for (let j = 0; j < match[1].length; j++) {
        if (match[1][j] === "<") {
          console.log(
            `Found '<' at position ${j}, next 10 chars:`,
            JSON.stringify(match[1].substring(j, j + 10)),
          );
        }
      }
    }
  }
}
