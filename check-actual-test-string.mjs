import { readFileSync } from "fs";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find all test strings
const regex = /const text = "([^"]+)"/g;
let match;

console.log("=== All test strings ===\n");
let testIndex = 1;
while ((match = regex.exec(testContent)) !== null) {
  const text = match[1];
  console.log(`Test ${testIndex}: ${JSON.stringify(text)}`);

  // Check if it contains thinking
  if (text.includes("thinking")) {
    console.log("  Contains thinking");

    // Print character codes around thinking
    const thinkingIndex = text.indexOf("thinking");
    if (thinkingIndex !== -1) {
      console.log('  Around "thinking":');
      for (
        let i = Math.max(0, thinkingIndex - 2);
        i < Math.min(text.length, thinkingIndex + 15);
        i++
      ) {
        const char = text[i];
        const code = text.charCodeAt(i);
        console.log(`    Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
      }
    }
  }
  testIndex++;
}
