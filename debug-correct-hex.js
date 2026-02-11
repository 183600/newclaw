// Construct the correct string from hex values
// From hex: 74 68 69 6e 6b 69 6e 67 3c 2f 74 68 69 6e 6b 3e
const thinkingPart = String.fromCharCode(116, 104, 105, 110, 107, 105, 110, 103); // "thinking"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "</thinking>"

console.log("Thinking part:", JSON.stringify(thinkingPart));
console.log("Closing tag:", JSON.stringify(closingTag));
console.log("Combined:", JSON.stringify(thinkingPart + closingTag));

// Also construct the inline code part
// From hex: 69 6e 65 20 63 6f 64 65 3c 2f 61 72 67 5f 76 61 6c 75 65 3e
const inlineCode = String.fromCharCode(105, 110, 101, 32, 99, 111, 100, 101); // "ine code"
const argClosingTag = String.fromCharCode(60, 47, 97, 114, 103, 95, 118, 97, 108, 117, 101, 62); // "</arg_value>"

console.log("Inline code part:", JSON.stringify(inlineCode));
console.log("Arg closing tag:", JSON.stringify(argClosingTag));

// Construct the full test string
const testText = `Text with \`inl${inlineCode}${argClosingTag}\` and outside ${thinkingPart}${closingTag}.`;
console.log("Full test text:", JSON.stringify(testText));

// Check character by character
console.log("\nCharacter codes around the closing tag:");
const closingTagIndex = testText.indexOf(closingTag);
if (closingTagIndex !== -1) {
  for (let i = closingTagIndex - 2; i <= closingTagIndex + closingTag.length + 2; i++) {
    if (i >= 0 && i < testText.length) {
      const char = testText[i];
      console.log(`  [${i}]: "${char}" (${char.charCodeAt(0)})`);
    }
  }
}
