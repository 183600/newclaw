// Let's see the exact characters in the test
import fs from "fs";
const testFile = fs.readFileSync(
  "/home/runner/work/newclaw/newclaw/src/shared/text/reasoning-tags.test.ts",
  "utf8",
);

// Find the inline code test
const lines = testFile.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("should handle inline code preservation")) {
    const textLine = lines[i + 1];
    console.log("Raw line:", textLine);

    // Extract the text between quotes
    const match = textLine.match(/const text = "([^"]+)";/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", JSON.stringify(text));

      // Check character by character
      for (let j = 0; j < text.length; j++) {
        const char = text[j];
        const code = char.charCodeAt(0);
        if (char === "`" || char === "\u0111" || char === "\u0110") {
          console.log(`Position ${j}: '${char}' (code ${code})`);
        }
      }
    }
    break;
  }
}
