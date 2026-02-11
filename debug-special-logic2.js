// Debug the special character logic
function debugSpecialCharacterLogic() {
  const text = "Before This is thinkingđ after.";

  console.log("=== Debugging Special Character Logic ===");
  console.log("Input:", JSON.stringify(text));
  console.log("Length:", text.length);

  // Show each character with index
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);
    const isSpecialOpen = char === "\u0110";
    console.log(`Index ${i}: "${char}" (${charCode}) ${isSpecialOpen ? "(Đ)" : ""}`);
  }

  // Now test the specific logic
  console.log("\n=== Testing specific positions ===");
  let i = 0;
  while (i < text.length) {
    if (i + 7 < text.length) {
      const substring8 = text.substring(i, i + 8);
      const substring7 = text.substring(i, i + 7);
      console.log(`Index ${i}: substring(8)="${substring8}", substring(7)="${substring7}"`);

      // Check for closing tags
      if (substring8 === "thinking\u0110") {
        console.log(`  MATCH: thinking closing tag at index ${i}!`);
      }
      if (substring7 === "thought\u0110") {
        console.log(`  MATCH: thought closing tag at index ${i}!`);
      }
    }
    i++;
  }
}

debugSpecialCharacterLogic();
