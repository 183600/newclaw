import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test the actual text from the test file with character codes
const text1 = "Before This is thinking\u0111 after.";
console.log("Test 1 with special char:", JSON.stringify(text1));
console.log("Test 1 with special char result:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Check what the actual test file contains
import fs from "fs";
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Before This is thinking")) {
    console.log("Line", i, ":", JSON.stringify(lines[i]));
    // Print character codes
    for (let j = 0; j < lines[i].length; j++) {
      if (lines[i][j] === "t" && lines[i].substring(j, j + 8) === "thinking") {
        console.log(
          "Found 'thinking' at position",
          j,
          "next char code:",
          lines[i].charCodeAt(j + 8),
        );
      }
    }
  }
}
