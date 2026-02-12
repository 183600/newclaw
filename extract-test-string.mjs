import { readFileSync } from "fs";

// Read the test file
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Use a more specific regex to find the test string
const regex = /const text = "([^"]+)"/g;
let match;

while ((match = regex.exec(testContent)) !== null) {
  const text = match[1];
  if (text.includes("thinking")) {
    console.log("Found test string:", JSON.stringify(text));

    // Check character codes
    console.log("\nCharacter codes:");
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = text.charCodeAt(i);
      const isSpecial = code < 32 || code > 126;
      if (isSpecial || char === "<" || char === "/" || char === ">") {
        console.log(
          `Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})${isSpecial ? " - SPECIAL!" : ""}`,
        );
      }
    }
    break;
  }
}
