// Check what comes exactly after "thinking"
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

const thinkingIndex = testText.indexOf("thinking");
if (thinkingIndex !== -1) {
  console.log("Found 'thinking' at index:", thinkingIndex);

  // Show what comes after "thinking"
  const afterThinking = testText.substring(
    thinkingIndex,
    Math.min(thinkingIndex + 12, testText.length),
  );
  console.log("Characters after 'thinking':", JSON.stringify(afterThinking));

  // Check character by character
  for (let i = thinkingIndex; i < Math.min(thinkingIndex + 12, testText.length); i++) {
    const char = testText[i];
    const code = char.charCodeAt(0);
    console.log(`Position ${i}: '${char}' -> ${code} (0x${code.toString(16)})`);
  }

  // Test different patterns
  console.log("\nTesting different patterns:");
  console.log("Match 'thinking</t>':", /thinking<\/t>/.test(testText));
  console.log("Match 'thinking<':", /thinking</.test(testText));
  console.log("Match 'thinking<\\/t>':", /thinking<\/t>/.test(testText));

  // Test what actually comes after thinking
  const substring = testText.substring(thinkingIndex + 8, thinkingIndex + 12);
  console.log("Actual substring after 'thinking':", JSON.stringify(substring));
}
