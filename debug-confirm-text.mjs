// Make sure we're using the correct text
import { readFileSync } from "fs";

// Get the exact text from the file
const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const testLine = testContent.split("\n").find((line) => line.includes("Before This is thinking"));

if (testLine) {
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Exact test text from file:", JSON.stringify(testText));
    console.log("Text length:", testText.length);

    // Test if the text actually contains what we think it does
    console.log("Contains 'thinking':", testText.includes("thinking"));
    console.log("Contains '<':", testText.includes("<"));
    console.log("Contains '</t>':", testText.includes(""));

    // Find 'thinking' and check what comes after
    const thinkingIndex = testText.indexOf("thinking");
    if (thinkingIndex !== -1) {
      console.log("Found 'thinking' at index:", thinkingIndex);

      // Show the next 15 characters
      const nextChars = testText.substring(thinkingIndex, thinkingIndex + 15);
      console.log("Next 15 characters:", JSON.stringify(nextChars));

      // Check character by character
      for (let i = thinkingIndex; i < Math.min(thinkingIndex + 15, testText.length); i++) {
        const char = testText[i];
        const code = char.charCodeAt(0);
        console.log(`Position ${i}: '${char}' -> ${code}`);
      }
    }

    // Test the modified regex
    const modifiedRe =
      /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;
    console.log("\nModified regex matches:");
    const modifiedMatches = [...testText.matchAll(modifiedRe)];
    modifiedMatches.forEach((match, index) => {
      console.log(`  Match ${index}: "${match[0]}" at ${match.index} (length: ${match[0].length})`);
    });
  }
}
