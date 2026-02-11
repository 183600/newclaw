import fs from "fs";

// Check what the actual test file contains in binary
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

      // Check if it contains the special character
      console.log("Contains special char đ:", match[1].includes("\u0111"));
      console.log("Contains HTML entity:", match[1].includes("&#x111;"));
      console.log("Contains literal &#x111;:", match[1].includes("&#x111;"));

      // Print each character with its code
      for (let j = 0; j < match[1].length; j++) {
        console.log(`  ${j}: '${match[1][j]}' (${match[1].charCodeAt(j)})`);
      }
    }
  }
}
