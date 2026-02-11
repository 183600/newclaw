import fs from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Read the test file directly
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find and test each test case
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const text = "')) {
    const match = lines[i].match(/const text = "([^"]+)";/);
    if (match) {
      const text = match[1];
      console.log(`Test line ${i + 1}:`, JSON.stringify(text));
      console.log(`Output:`, JSON.stringify(stripReasoningTagsFromText(text)));
      console.log("");
    }
  }
}
