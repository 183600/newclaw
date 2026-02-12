// Check the exact condition for thinkingđ
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";

console.log("Checking condition at position 53:");
console.log("i + 8 < length:", 53 + 8 < overlappingText.length);
console.log("substring(53, 61):", overlappingText.substring(53, 61));
console.log("substring(53, 62):", overlappingText.substring(53, 62));

// Let's construct the expected string
const expected = "thinking" + String.fromCharCode(273);
console.log("Expected string:", expected);
console.log("Expected string length:", expected.length);

// Check if they match
console.log("\nMatching:");
console.log("substring(53, 61) === expected:", overlappingText.substring(53, 61) === expected);
console.log("substring(53, 62) === expected:", overlappingText.substring(53, 62) === expected);

// Let's check character by character
console.log("\nCharacter by character comparison:");
for (let i = 0; i < expected.length; i++) {
  const actualChar = overlappingText.charAt(53 + i);
  const expectedChar = expected.charAt(i);
  console.log(
    `  Position ${53 + i}: actual="${actualChar}" (${overlappingText.charCodeAt(53 + i)}), expected="${expectedChar}" (${expected.charCodeAt(i)}), match=${actualChar === expectedChar}`,
  );
}
