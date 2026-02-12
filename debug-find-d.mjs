// Find the exact position of thinkingđ
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
console.log("Text:", overlappingText);

// Let's look at each character around where thinkingđ should be
console.log("\nCharacters around position 53-65:");
for (let i = 50; i < 65; i++) {
  if (i < overlappingText.length) {
    console.log(
      `  Position ${i}: "${overlappingText.charAt(i)}" (${overlappingText.charCodeAt(i)})`,
    );
  }
}

// Let's search for đ character
console.log("\nSearching for đ character:");
for (let i = 0; i < overlappingText.length; i++) {
  if (overlappingText.charCodeAt(i) === 273) {
    console.log(`  Found đ at position ${i}`);
    // Check surrounding characters
    const start = Math.max(0, i - 10);
    const end = Math.min(overlappingText.length, i + 2);
    console.log(`  Context: "${overlappingText.substring(start, end)}"`);
  }
}
