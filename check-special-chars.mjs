// Check the exact characters in the test
const text = "Text with `inline code ` and outside thinking.";
console.log("Input:", text);

// Check for special characters
for (let i = 0; i < text.length; i++) {
  const char = text.charAt(i);
  const code = text.charCodeAt(i);
  if (code > 127) {
    console.log(`Special character at position ${i}: "${char}" (${code})`);
  }
}

// Check if there's a đ after thinking
const thinkingIndex = text.indexOf("thinking");
if (thinkingIndex !== -1) {
  const afterThinking = text.charAt(thinkingIndex + 8); // 8 = length of "thinking"
  console.log("Character after thinking:", afterThinking);
  console.log("Character code after thinking:", afterThinking.charCodeAt(0));
}
