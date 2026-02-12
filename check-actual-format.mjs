import { readFileSync } from "fs";

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
      console.log("Text line:", JSON.stringify(textLine));

      // Extract the text string
      const match = textLine.match(/const text = "([^"]+)"/);
      if (match) {
        const text = match[1];
        console.log("Extracted text:", JSON.stringify(text));

        // Print each character with its code
        console.log("\nCharacter by character:");
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const code = text.charCodeAt(i);
          console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
        }
      }
    }
  }
}
