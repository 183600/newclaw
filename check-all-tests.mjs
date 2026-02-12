import { readFileSync } from "fs";

// Read the test file and extract all test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");

console.log("=== All test strings ===\n");

for (const line of lines) {
  if (line.includes("const text = ")) {
    const match = line.match(/const text = "([^"]+)"/);
    if (match) {
      const text = match[1];
      console.log("Test string:", JSON.stringify(text));

      // Check for special patterns
      if (text.includes("&#x")) {
        console.log("  Contains HTML entity");
      }
      if (text.includes("<")) {
        console.log("  Contains HTML tags");
      }
      if (text.includes("Đ") || text.includes("đ")) {
        console.log("  Contains special characters");
      }
      console.log();
    }
  }
}
