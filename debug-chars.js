// Debug script to check the actual characters in the test
const testText = "Before This is thinking after.";
console.log("Full text:", testText);
console.log("Character codes:");
for (let i = 0; i < testText.length; i++) {
  const char = testText[i];
  const code = char.charCodeAt(0);
  console.log(`'${char}' -> ${code} (0x${code.toString(16)})`);
}

// Check specifically for the special character
const thinkingIndex = testText.indexOf("thinking");
if (thinkingIndex !== -1) {
  console.log("\nFound 'thinking' at index:", thinkingIndex);
  const specialChar = testText[thinkingIndex - 1];
  console.log("Character before 'thinking':", specialChar, "code:", specialChar.charCodeAt(0));
}
