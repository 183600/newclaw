// Check the actual string content
// From hex: 74 68 69 6e 6b 69 6e 67 3c 2f 74 68 69 6e 6b 3e
const thinkingTag = "thinking"; // Should be "thinking"

console.log("Thinking tag:", JSON.stringify(thinkingTag));
console.log("Length:", thinkingTag.length);
console.log("Char codes:");
for (let i = 0; i < thinkingTag.length; i++) {
  console.log(`  [${i}]: "${thinkingTag[i]}" (${thinkingTag.charCodeAt(i)})`);
}

// Check what we're actually looking for
const testText = `Text with \`inline code\` and outside ${thinkingTag}.`;
console.log("\nFull test text:", JSON.stringify(testText));
console.log("Looking for '' tag:", testText.includes(""));
