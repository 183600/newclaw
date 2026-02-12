// Check the condition step by step
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";

console.log("Text:", overlappingText);
console.log("Length:", overlappingText.length);

// Check each position
for (let i = 50; i < 65; i++) {
  if (i < overlappingText.length) {
    console.log(`\nPosition ${i}:`);
    console.log(`  Character: "${overlappingText.charAt(i)}" (${overlappingText.charCodeAt(i)})`);

    // Check if it could be the start of thinkingđ
    if (i + 8 < overlappingText.length) {
      const substring = overlappingText.substring(i, i + 8);
      console.log(`  substring(i, i+8): "${substring}"`);
      console.log(`  Is thinkingđ: ${substring === "thinking\u0111"}`);
    }

    // Check if it could be the start of thoughtđ
    if (i + 7 < overlappingText.length) {
      const substring = overlappingText.substring(i, i + 7);
      console.log(`  substring(i, i+7): "${substring}"`);
      console.log(`  Is thoughtđ: ${substring === "thought\u0111"}`);
    }
  }
}

// Let's manually construct thinkingđ and compare
const thinkingđ = "thinking" + String.fromCharCode(273);
console.log("\nManually constructed thinkingđ:", thinkingđ);
console.log("Character codes:");
for (let i = 0; i < thinkingđ.length; i++) {
  console.log(`  Position ${i}: "${thinkingđ.charAt(i)}" (${thinkingđ.charCodeAt(i)})`);
}
