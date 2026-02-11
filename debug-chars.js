// Debug the exact characters in test cases

function debugChars(text) {
  console.log(`Text: "${text}"`);
  console.log("Char codes:");
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    const hex = code.toString(16);
    console.log(`  [${i}] "${char}" (${code}) (0x${hex})`);
  }
  console.log("---");
}

// Debug the actual test case strings
debugChars("Before This is thinking after.");
debugChars("Start First thought middle Second thought end.");

// Test what the special characters look like
console.log("Special characters:");
console.log("đ:", "đ".charCodeAt(0), "0x" + "đ".charCodeAt(0).toString(16));
console.log("Đ:", "Đ".charCodeAt(0), "0x" + "Đ".charCodeAt(0).toString(16));
