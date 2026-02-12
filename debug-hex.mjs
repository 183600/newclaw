import { readFileSync } from "fs";

// Read the test file and extract the exact test strings
const testContent = readFileSync("./src/shared/text/reasoning-tags.test.ts", "utf8");

// Find all test strings
const regex = /const text = "([^"]+)"/g;
let match;

console.log("=== All test strings in hex ===\n");
let testIndex = 1;
while ((match = regex.exec(testContent)) !== null) {
  const text = match[1];
  console.log(`Test ${testIndex}:`);
  console.log(`  Raw: ${JSON.stringify(text)}`);

  // Convert to hex
  const hex = Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
  console.log(`  Hex: ${hex}`);

  // Look for patterns
  if (text.includes("thinking") && !text.includes("<")) {
    console.log("  -> Contains thinking but no HTML tags");
  }
  testIndex++;
}
