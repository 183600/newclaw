// Check the exact input
const text = "Text with `inline code ` and outside thinking.";
console.log("Input:", text);
console.log("Length:", text.length);

// Check character by character
for (let i = 0; i < text.length; i++) {
  const char = text.charAt(i);
  const code = text.charCodeAt(i);
  const display = code === 32 ? "SPACE" : char;
  console.log(`Position ${i}: "${display}" (${code})`);
}

// Find the thinkingđ
const thinkingIndex = text.indexOf("thinking");
console.log("thinking at position:", thinkingIndex);
console.log("Character before thinking:", text.charAt(thinkingIndex - 1));
