import { readFileSync } from "fs";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the line with the test
for (const line of lines) {
  if (line.includes("should remove simple thinking tags")) {
    console.log("Found line:", line);

    // Extract the text string
    const match = line.match(/const text = "([^"]+)"/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", JSON.stringify(text));

      // Check if it contains HTML tags
      if (text.includes("<")) {
        console.log("Contains HTML tags");
      }
      if (text.includes("&#x")) {
        console.log("Contains HTML entities");
      }
    }
  }
}
