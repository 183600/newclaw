// Check the character codes for special characters
const text = "Before This is thinking after.";
console.log("Character codes:");
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = text.charCodeAt(i);
  if (code < 32 || code > 126) {
    console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)}) - SPECIAL!`);
  }
}

// Check around the thinking part
const thinkingIndex = text.indexOf("thinking");
if (thinkingIndex !== -1) {
  console.log("\nAround 'thinking':");
  for (let i = Math.max(0, thinkingIndex - 2); i < Math.min(text.length, thinkingIndex + 15); i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    const isSpecial = code < 32 || code > 126;
    console.log(
      `Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})${isSpecial ? " - SPECIAL!" : ""}`,
    );
  }
}
