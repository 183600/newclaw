// Read the exact text from the test file
import { readFileSync } from "fs";

const testContent = readFileSync("src/agents/pi-embedded-utils.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the line with the test text
const testLine = lines.find((line) => line.includes("Pensando sobre el problema"));

if (testLine) {
  console.log("Found test line:", testLine);

  // Extract the text using regex
  const match = testLine.match(/text: "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Extracted text:", JSON.stringify(testText));
    console.log("Text length:", testText.length);

    // Show character codes
    console.log("\nCharacter codes:");
    for (let i = 0; i < Math.min(testText.length, 15); i++) {
      const char = testText[i];
      const code = char.charCodeAt(0);
      const hex = code.toString(16);
      console.log(`Position ${i}: '${char}' -> ${code} (0x${hex})`);
    }

    // Test the regex
    const testRegex = /^thinking[\s\S]*/;
    console.log("\nTesting regex:");
    console.log("Regex matches:", testRegex.test(testText));

    // Test if the text starts with "thinking"
    console.log("Starts with 'thinking':", testText.startsWith("thinking"));
    console.log("First 10 chars:", testText.substring(0, 10));

    // Test the stripThinkingTagsFromText function
    const { stripThinkingTagsFromText } = await import("./src/agents/pi-embedded-utils.js");

    const result = stripThinkingTagsFromText(testText);
    console.log("\nFunction result:", JSON.stringify(result));
    console.log("Expected:", JSON.stringify(""));
    console.log("Match:", result === "");
  }
}
