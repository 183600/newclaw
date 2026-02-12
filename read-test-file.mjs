import fs from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Read the test file to get the exact input
const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testFile.split("\n");

// Find the line with the test input
for (const line of lines) {
  if (line.includes("inline code")) {
    console.log("Test line:", line);
    // Extract the text from the line
    const match = line.match(/const text = "(.+)";/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", text);
      console.log("Text length:", text.length);

      // Check for special characters
      for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const code = text.charCodeAt(i);
        if (code === 273) {
          // đ
          console.log(`Found đ at position ${i}`);
        }
      }

      const result = stripReasoningTagsFromText(text);
      console.log("Output:", result);
      console.log('Contains "inline code ":', result.includes("inline code "));
      console.log('Contains "thinking":', result.includes("thinking"));
    }
    break;
  }
}
