// Check the exact content of the input string
const text = "Before <thinking>content after.";
console.log("Input:", text);
console.log("Length:", text.length);

// Check character by character
for (let i = 0; i < text.length; i++) {
  const char = text.charAt(i);
  const code = text.charCodeAt(i);
  const display = code === 32 ? "SPACE" : char;
  console.log(`Position ${i}: "${display}" (${code})`);
}

// Check the position of <thinking>
const thinkingIndex = text.indexOf("<thinking>");
console.log("<thinking> at position:", thinkingIndex);
console.log("Character before <thinking>:", text.charAt(thinkingIndex - 1));
console.log("Character code before <thinking>:", text.charCodeAt(thinkingIndex - 1));
