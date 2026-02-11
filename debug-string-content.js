// Debug the actual string content character by character
const thinkingTag = "thinking";
const testText = `Text with \`inline code\` and outside ${thinkingTag}.`;

console.log("Full string:");
for (let i = 0; i < testText.length; i++) {
  const char = testText[i];
  const code = char.charCodeAt(0);
  console.log(`  [${i}]: "${char}" (${code})`);
}

// Search for the closing tag character by character
console.log("\nSearching for '' tag:");
for (let i = 0; i < testText.length - "".length + 1; i++) {
  const substring = testText.substring(i, i + "".length);
  if (substring === "") {
    console.log(`Found '' at index ${i}`);
    console.log(
      "Context:",
      JSON.stringify(testText.substring(Math.max(0, i - 5), i + "".length + 5)),
    );
  }
}

// Check if there are any special characters
console.log("\nChecking for special characters:");
const specialChars = testText.split("").filter((char) => char.charCodeAt(0) > 127);
console.log(
  "Special characters:",
  specialChars.map((char) => `"${char}" (${char.charCodeAt(0)})`),
);
