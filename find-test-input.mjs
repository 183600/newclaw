import fs from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Read the test file to get the exact input
const testFile = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testFile.split("\n");

// Find the line with the test input
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const text =")) {
    console.log("Line:", lines[i]);
    // Extract the text from the line
    const match = lines[i].match(/const text = "(.+)";/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", text);
      console.log("Text length:", text.length);

      // Check for special characters
      for (let j = 0; j < text.length; j++) {
        const char = text.charAt(j);
        const code = text.charCodeAt(j);
        if (code === 273) {
          // đ
          console.log(`Found đ at position ${j}`);
        }
      }

      const result = stripReasoningTagsFromText(text);
      console.log("Output:", result);
      console.log('Contains "inline code ":', result.includes("inline code "));
      console.log('Contains "thinking":', result.includes("thinking"));
    }
  }
}
