import { readFileSync } from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Read the test file and extract the test case
const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the test case
const start = testContent.indexOf('const text = "Text with');
const end = testContent.indexOf('";', start);
const textLine = testContent.substring(start, end + 2);

console.log("Test line from file:", textLine);

// Extract the actual text
const match = textLine.match(/const text = "(.*)";/);
if (match) {
  const text = match[1];
  console.log("Extracted text:", JSON.stringify(text));

  // Check for special characters
  console.log("\nSpecial character analysis:");
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if (code === 273 || code === 272) {
      console.log(`Position ${i}: "${char}" (code: ${code})`);
    }
  }

  const result = stripReasoningTagsFromText(text);
  console.log("\nOutput:", JSON.stringify(result));

  // Check what the test expects
  console.log("\nTest expectations:");
  console.log('Contains "inline code":', result.includes("inline code"));
  console.log('Contains "thinking":', result.includes("thinking"));
}
