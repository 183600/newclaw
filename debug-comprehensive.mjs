// Comprehensive debug of all regex patterns in the function
import { readFileSync } from "fs";

// Get the exact text from the file
const testContent = readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const testLine = testContent.split("\n").find((line) => line.includes("Before This is thinking"));

if (testLine) {
  const match = testLine.match(/const text = "([^"]+)"/);
  if (match) {
    const testText = match[1];
    console.log("Test text:", JSON.stringify(testText));

    // Import the function and test it step by step
    import("./src/shared/text/reasoning-tags.js")
      .then((module) => {
        const { stripReasoningTagsFromText } = module;

        // Test all the regex patterns used in the function

        // QUICK_TAG_RE
        const QUICK_TAG_RE =
          /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;
        console.log("\nQUICK_TAG_RE matches:", QUICK_TAG_RE.test(testText));
        if (QUICK_TAG_RE.test(testText)) {
          const QUICK_TAG_RE_GLOBAL = new RegExp(QUICK_TAG_RE.source, "gi");
          const matches = [...testText.matchAll(QUICK_TAG_RE_GLOBAL)];
          console.log("QUICK_TAG_RE matches:", matches);
        }

        // FINAL_TAG_RE
        const FINAL_TAG_RE = /<\s*\/\s*final\b[^<>]*>/gi;
        console.log("FINAL_TAG_RE matches:", FINAL_TAG_RE.test(testText));

        // THINKING_TAG_RE
        const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
        console.log("THINKING_TAG_RE matches:", [...testText.matchAll(THINKING_TAG_RE)]);

        // unpairedWordTagRe (modified)
        const unpairedWordTagRe =
          /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;
        console.log("unpairedWordTagRe matches:", [...testText.matchAll(unpairedWordTagRe)]);

        // plainClosingTagRe
        const plainClosingTagRe =
          /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;
        console.log("plainClosingTagRe matches:", [...testText.matchAll(plainClosingTagRe)]);

        // Test the actual function
        const result = stripReasoningTagsFromText(testText);
        console.log("\nFunction result:", JSON.stringify(result));
        console.log("Expected result:", JSON.stringify("Before  after."));
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }
}
