import { readFileSync } from "fs";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the line with the test
for (const line of lines) {
  if (line.includes("This is thinking")) {
    console.log("Found line:", line);

    // Extract the text string
    const match = line.match(/const text = "([^"]+)"/);
    if (match) {
      const text = match[1];
      console.log("Extracted text:", JSON.stringify(text));

      console.log("\nCharacter codes around 'thinking':");
      const thinkingIndex = text.indexOf("thinking");
      if (thinkingIndex !== -1) {
        for (
          let i = Math.max(0, thinkingIndex - 2);
          i < Math.min(text.length, thinkingIndex + 15);
          i++
        ) {
          const char = text[i];
          const code = text.charCodeAt(i);
          console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
        }
      }
    }
  }
}
