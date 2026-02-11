import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with HTML entities
const text1 = "Before This is thinking&#x111; after.";
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
      console.log("Contains &#x111;:", match[1].includes("&#x111;"));
      console.log("Contains &lt;", match[1].includes("&lt;"));
      console.log("Contains &gt;", match[1].includes("&gt;"));

      // Print each character with its code
      for (let j = 0; j < match[1].length; j++) {
        if (match[1].substring(j, j + 6) === "&#x111;") {
          console.log(`Found HTML entity at position ${j}`);
        }
      }
    }
  }
}
