// Test the special character logic from the function
function testSpecialCharacterLogic() {
  const text = "Before This is thinkingđ after.";
  let cleaned = text;

  console.log("=== Testing Special Character Logic ===");
  console.log("Input:", cleaned);

  // Simulate the logic from the function
  let i = 0;
  while (i < cleaned.length) {
    // Check for special character opening tags (Đthinking or Đthought)
    if (cleaned[i] === "\u0110" && i + 7 < cleaned.length) {
      const tagWord = cleaned.substring(i + 1, i + 8);
      console.log(`Found potential opening tag at index ${i}: "${cleaned[i]}" + "${tagWord}"`);
      if (tagWord === "thinking" || tagWord === "thought") {
        console.log("  This is a valid opening tag!");
        i += 8;
        continue;
      }
    }

    // Check for special character closing tags (thinkingđ or thoughtđ)
    if (
      i + 7 < cleaned.length &&
      (cleaned.substring(i, i + 8) === "thinking\u0111" ||
        cleaned.substring(i, i + 7) === "thought\u0111")
    ) {
      console.log(`Found closing tag at index ${i}: "${cleaned.substring(i, i + 8)}"`);
      i += cleaned.substring(i, i + 8) === "thinking\u0111" ? 8 : 7;
      continue;
    }

    i++;
  }

  console.log("Finished scanning");
}

// Test the actual matching
console.log("Direct matching tests:");
console.log('"thinkingđ" === "thinking\u0111":', "thinkingđ" === "thinking\u0111");
console.log('"thoughtđ" === "thought\u0111":', "thoughtđ" === "thought\u0111");

testSpecialCharacterLogic();
