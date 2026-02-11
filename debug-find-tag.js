// Debug finding the closing tag
const thinkingTag = "thinking";
const testText = `Text with \`inline code\` and outside ${thinkingTag}.`;

console.log("Test text:", JSON.stringify(testText));
console.log("Length:", testText.length);

// Find the closing tag
const closingTagStart = testText.indexOf("");
console.log("Closing tag start index:", closingTagStart);

if (closingTagStart !== -1) {
  console.log("Closing tag found at index:", closingTagStart);
  console.log("Context around closing tag:");
  const start = Math.max(0, closingTagStart - 5);
  const end = Math.min(testText.length, closingTagStart + "".length + 5);
  const context = testText.substring(start, end);
  console.log("Context:", JSON.stringify(context));

  // Check each character
  console.log("Characters around the tag:");
  for (let i = closingTagStart - 2; i <= closingTagStart + "".length + 2; i++) {
    if (i >= 0 && i < testText.length) {
      const char = testText[i];
      console.log(`  [${i}]: "${char}" (${char.charCodeAt(0)})`);
    }
  }
} else {
  console.log("Closing tag not found!");

  // Let's search for "thinking" and see what's around it
  const thinkingIndex = testText.indexOf("thinking");
  if (thinkingIndex !== -1) {
    console.log("Found 'thinking' at index:", thinkingIndex);
    console.log("Context around 'thinking':");
    const start = Math.max(0, thinkingIndex - 5);
    const end = Math.min(testText.length, thinkingIndex + "thinking".length + 5);
    const context = testText.substring(start, end);
    console.log("Context:", JSON.stringify(context));

    // Check what comes after "thinking"
    const afterThinking = testText.substring(thinkingIndex + "thinking".length);
    console.log("After 'thinking':", JSON.stringify(afterThinking.substring(0, 10)));
  }
}
