// Read the exact text from the test file
import { readFileSync } from "fs";

const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");

// Find the line with the test text
const lines = testContent.split("\n");
const testLine = lines.find((line) => line.includes('const text = "Before This is thinking'));

if (testLine) {
  console.log("Found test line:", testLine);

  // Extract the text
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Extracted text:", JSON.stringify(testText));
    console.log("Text length:", testText.length);

    // Test the regex
    const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
    const matches = [...testText.matchAll(THINKING_TAG_RE)];
    console.log("THINKING_TAG_RE matches:", matches);

    if (matches.length > 0) {
      console.log("Found matches!");
      matches.forEach((match, index) => {
        console.log(`Match ${index}: "${match[0]}" at index ${match.index}`);
      });
    } else {
      console.log("No matches found. Let's check why...");

      // Check if it contains the expected characters
      console.log("Contains '<':", testText.includes("<"));
      console.log("Contains '</t>':", testText.includes(""));

      // Find 'thinking' and show context
      const thinkingIndex = testText.indexOf("thinking");
      if (thinkingIndex !== -1) {
        const context = testText.substring(
          Math.max(0, thinkingIndex - 3),
          Math.min(testText.length, thinkingIndex + 10),
        );
        console.log("Context around 'thinking':", JSON.stringify(context));
      }
    }
  }
}
