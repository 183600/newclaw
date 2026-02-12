// Final correct test with the exact text from the test file
import { readFileSync } from "fs";

const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const testLine = testContent.split("\n").find((line) => line.includes("Before This is thinking"));

if (testLine) {
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Correct test text:", JSON.stringify(testText));
    console.log("Text length:", testText.length);

    // Test the actual function
    import("./src/shared/text/reasoning-tags.js")
      .then((module) => {
        const { stripReasoningTagsFromText } = module;
        const result = stripReasoningTagsFromText(testText);
        console.log("Function result:", JSON.stringify(result));
        console.log("Expected result:", JSON.stringify("Before  after."));
        console.log("Match:", result === "Before  after.");
      })
      .catch((err) => {
        console.log("Error importing module:", err);

        // Test the regex patterns directly
        const unpairedWordTagRe =
          /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

        console.log("\nTesting unpairedWordTagRe:");
        const matches = [...testText.matchAll(unpairedWordTagRe)];
        console.log("Matches:", matches);

        // Check what comes after "thinking"
        const thinkingIndex = testText.indexOf("thinking");
        if (thinkingIndex !== -1) {
          const afterThinking = testText.substring(
            thinkingIndex,
            Math.min(thinkingIndex + 12, testText.length),
          );
          console.log("Characters after 'thinking':", JSON.stringify(afterThinking));

          // Check character by character
          for (let i = thinkingIndex; i < Math.min(thinkingIndex + 12, testText.length); i++) {
            const char = testText[i];
            const code = char.charCodeAt(0);
            console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
          }
        }
      });
  }
}
