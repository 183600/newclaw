// Check why thinkingđ is not found
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
console.log("Text:", overlappingText);
console.log("Length:", overlappingText.length);

// Find the position of thinkingđ
const thinkingđIndex = overlappingText.indexOf("thinkingđ");
console.log("thinkingđ found at position:", thinkingđIndex);

// Check the character at that position
if (thinkingđIndex !== -1) {
  console.log(
    "Substring at position:",
    overlappingText.substring(thinkingđIndex, thinkingđIndex + 8),
  );
  console.log("Character codes:");
  for (let i = 0; i < 8; i++) {
    console.log(
      `  Position ${thinkingđIndex + i}: "${overlappingText.charAt(thinkingđIndex + i)}" (${overlappingText.charCodeAt(thinkingđIndex + i)})`,
    );
  }
}

// Check what our loop is doing
console.log("\nLoop simulation:");
let i = 0;
while (i < overlappingText.length) {
  if (overlappingText.charCodeAt(i) === 272) {
    console.log(`Position ${i}: Found Đ (char code 272)`);
  }
  if (i + 7 < overlappingText.length && overlappingText.substring(i, i + 8) === "thinking\u0111") {
    console.log(`Position ${i}: Found thinkingđ`);
    break;
  }
  i++;
}
