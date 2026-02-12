import { readFileSync } from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the line with the test
for (const line of lines) {
  if (line.includes("should remove simple thinking tags")) {
    // Look for the next line with the text
    const nextLineIndex = lines.indexOf(line) + 1;
    if (nextLineIndex < lines.length) {
      const textLine = lines[nextLineIndex];
      const match = textLine.match(/const text = "([^"]+)"/);
      if (match) {
        const text = match[1];
        console.log("Test string:", JSON.stringify(text));

        // Test the function
        const result = stripReasoningTagsFromText(text);
        console.log("Result:", JSON.stringify(result));
        console.log("Expected:", JSON.stringify("Before  after."));
        console.log("Pass:", result === "Before  after.");
      }
    }
  }
}
