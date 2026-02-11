import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test with HTML tags (which should work)
const text1 = "Before <thinking>This is thinking</thinking> after.";
console.log("Test with HTML tags:", JSON.stringify(stripReasoningTagsFromText(text1)));

// Test with special characters
const text2 = "Before ĐthinkingThis is thinkingđ after.";
console.log("Test with special chars:", JSON.stringify(stripReasoningTagsFromText(text2)));

// What the test actually has
const text3 = "Before This is thinkingđ after.";
console.log("Test actual test case:", JSON.stringify(stripReasoningTagsFromText(text3)));

// Let's check the regex
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)/i;
console.log("Regex test on text3:", QUICK_TAG_RE.test(text3));

// Let's check what the test file actually contains
import fs from "fs";
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Find the test line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Before This is thinking")) {
    console.log("Raw line:", JSON.stringify(lines[i]));

    // Extract the text
    const match = lines[i].match(/const text = "([^"]+)";/);
    if (match) {
      console.log("Extracted text:", JSON.stringify(match[1]));
      console.log("Text length:", match[1].length);

      // Print each character with its code
      for (let j = 0; j < match[1].length; j++) {
        if (match[1][j] === "t" && match[1].substring(j, j + 8) === "thinking") {
          console.log("Found 'thinking' at position", j);
          for (let k = 0; k < 10; k++) {
            if (j + k < match[1].length) {
              console.log(`  ${j + k}: '${match[1][j + k]}' (${match[1].charCodeAt(j + k)})`);
            }
          }
        }
      }
    }
  }
}
