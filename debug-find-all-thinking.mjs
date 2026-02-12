// Let's count the characters more carefully
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";

console.log("Text:", overlappingText);

// Let's find the exact position of "thinking"
const thinkingIndex = overlappingText.indexOf("thinking");
console.log('\n"thinking" found at position:', thinkingIndex);

// Let's check the characters around that position
console.log('\nCharacters around "thinking":');
for (let i = thinkingIndex - 2; i < thinkingIndex + 10; i++) {
  if (i >= 0 && i < overlappingText.length) {
    console.log(
      `  Position ${i}: "${overlappingText.charAt(i)}" (${overlappingText.charCodeAt(i)})`,
    );
  }
}

// Let's check if "thinking" at position 53 is the one we want
console.log('\nIs "thinking" at position 53 the one we want?');
console.log("Substring from 53 to 61:", overlappingText.substring(53, 61));
console.log("Substring from 53 to 62:", overlappingText.substring(53, 62));

// Let's check all occurrences of "thinking"
console.log('\nAll occurrences of "thinking":');
let index = overlappingText.indexOf("thinking");
while (index !== -1) {
  console.log(`  Found at position ${index}`);
  console.log(
    `    Context: "${overlappingText.substring(Math.max(0, index - 5), Math.min(overlappingText.length, index + 15))}"`,
  );
  index = overlappingText.indexOf("thinking", index + 1);
}
