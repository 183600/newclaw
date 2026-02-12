// Carefully check the exact text and regex
import { readFileSync } from "fs";

// Get the exact text from the file
const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const testLine = testContent.split("\n").find((line) => line.includes("Before This is thinking"));

if (testLine) {
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Exact test text:", JSON.stringify(testText));
    console.log("Text length:", testText.length);

    // Show character codes around the thinking tag
    const thinkingIndex = testText.indexOf("thinking");
    if (thinkingIndex !== -1) {
      console.log("\nCharacters around 'thinking':");
      const start = Math.max(0, thinkingIndex - 5);
      const end = Math.min(testText.length, thinkingIndex + 15);

      for (let i = start; i < end; i++) {
        const char = testText[i];
        const code = char.charCodeAt(0);
        const hex = code.toString(16);
        const printable = code >= 32 && code <= 126 ? char : `[${code}]`;
        console.log(`Position ${i}: ${printable} -> ${code} (0x${hex})`);
      }
    }

    // Test the unpairedWordTagRe step by step
    console.log("\nTesting unpairedWordTagRe components:");

    // Test the first part: (?:\bThis is |\b(\w+) )?
    const firstPart = /(?:\bThis is |\b(\w+) )?/gi;
    const firstMatches = [...testText.matchAll(firstPart)];
    console.log(
      "First part matches:",
      firstMatches.map((m) => `"${m[0]}" at ${m.index}`),
    );

    // Test the second part: (thinking|thought|antthinking)
    const secondPart = /(thinking|thought|antthinking)/gi;
    const secondMatches = [...testText.matchAll(secondPart)];
    console.log(
      "Second part matches:",
      secondMatches.map((m) => `"${m[0]}" at ${m.index}`),
    );

    // Test the third part: (?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)
    const thirdPart = /(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;
    const thirdMatches = [...testText.matchAll(thirdPart)];
    console.log(
      "Third part matches:",
      thirdMatches.map((m) => `"${m[0]}" at ${m.index}`),
    );

    // Test the complete pattern
    const unpairedWordTagRe =
      /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;
    const completeMatches = [...testText.matchAll(unpairedWordTagRe)];
    console.log("Complete pattern matches:", completeMatches);
  }
}
