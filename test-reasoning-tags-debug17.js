import fs from "fs";
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Read the test file directly
const testContent = fs.readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

// Create a simple HTML parser to extract the test strings
function extractTestString(line) {
  const match = line.match(/const text = "([^"]+)";/);
  if (match) {
    return match[1];
  }
  return null;
}

// Find and test each test case
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const text = "')) {
    const text = extractTestString(lines[i]);
    if (text) {
      console.log(`Test line ${i + 1}:`, JSON.stringify(text));
      console.log(`Output:`, JSON.stringify(stripReasoningTagsFromText(text)));

      // Look for the expected result in the next few lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes("expect(result).toBe")) {
          const match = lines[j].match(/expect\(result\)\.toBe\("([^"]+)"\)/);
          if (match) {
            console.log(`Expected:`, JSON.stringify(match[1]));
            console.log(
              `Match:`,
              JSON.stringify(stripReasoningTagsFromText(text)) === JSON.stringify(match[1]),
            );
          }
          break;
        }
      }
      console.log("");
    }
  }
}
