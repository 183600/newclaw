// Manual test of the regex pattern
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

// Test the basic pattern
const basicPattern = /thinking<\/t>/i;
console.log("Basic pattern matches:", basicPattern.test(testText));

// Test with whitespace allowed
const whitespacePattern = /<\s*\/\s*thinking\s*>/i;
console.log("Whitespace pattern matches:", whitespacePattern.test(testText));

// Test step by step
console.log("\nStep by step test:");
console.log("Contains '<':", testText.includes("<"));
console.log("Contains '</t>':", testText.includes(""));

// Let's manually check the characters around 'thinking'
const thinkingIndex = testText.indexOf("thinking");
if (thinkingIndex !== -1) {
  console.log("Found 'thinking' at index:", thinkingIndex);
  const beforeChar = testText.substring(thinkingIndex - 2, thinkingIndex + 10);
  console.log("Context:", JSON.stringify(beforeChar));

  // Check each character
  for (let i = thinkingIndex - 2; i <= thinkingIndex + 8; i++) {
    if (i >= 0 && i < testText.length) {
      const char = testText[i];
      const code = char.charCodeAt(0);
      console.log(`Position ${i}: '${char}' (${code})`);
    }
  }
}
