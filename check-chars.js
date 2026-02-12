// Check the character codes in the test
const text = "Before This is thinking after.";
console.log("Character codes:");
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = text.charCodeAt(i);
  console.log(`'${char}' -> ${code} (0x${code.toString(16)})`);
}

// Check specific positions
console.log("\nAround 'thinking':");
const thinkingIndex = text.indexOf("thinking");
if (thinkingIndex !== -1) {
  for (let i = Math.max(0, thinkingIndex - 2); i < Math.min(text.length, thinkingIndex + 10); i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
  }
}
