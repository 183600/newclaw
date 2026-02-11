// Let's check if the special character is actually in the string
const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Checking character codes ===");

// Check each character
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  if (code === 0x0111 || code === 0x0110) {
    console.log(`Position ${i}: char="${char}" code=${code} hex=0x${code.toString(16)}`);

    // Show surrounding characters
    const start = Math.max(0, i - 10);
    const end = Math.min(text.length, i + 10);
    const context = text.substring(start, end);
    console.log(`  Context: "${context}"`);

    // Show the exact bytes
    const bytes = [];
    for (let j = start; j < end; j++) {
      bytes.push(`0x${text.charCodeAt(j).toString(16)}`);
    }
    console.log(`  Bytes: [${bytes.join(", ")}]`);
    console.log("");
  }
}

// Also check if there are any invisible characters
console.log("=== Checking for invisible characters ===");
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  if (code < 32 && code !== 10 && code !== 13) {
    console.log(`Control character at position ${i}: code=${code}`);
  }
}

// Let's also check the hex representation of the whole string
console.log("=== Hex representation ===");
const hexString = Array.from(text)
  .map((c) => `0x${c.charCodeAt(0).toString(16)}`)
  .join(" ");
console.log(hexString.substring(0, 200) + "...");

// Now let's check what the test actually expects
console.log("\n=== Test expectations ===");
console.log("From vitest error:");
console.log('expect(result).not.toContain("This should be removed")');
console.log('But result contains "This should be removed"');
console.log("");
console.log("This suggests the test string has special characters");
console.log("But our reading shows it does not");
console.log("");
console.log("Possible explanations:");
console.log("1. The test file encoding is different");
console.log("2. The special characters are added at runtime");
console.log("3. There is a bug in how we read the file");
