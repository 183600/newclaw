// Simple test without import issues
// Let's construct the string step by step

// From the test file, we need to understand what the actual string is
// The test shows: "Text with \`inline code\n\` and outside thinking."

// Let's assume the test uses the closing tag  from the hex output
const closingTag = String.fromCharCode(60, 47, 97, 114, 103, 95, 118, 97, 108, 117, 101, 62); // "

// And the thinking closing tag
const thinkingClosingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // ""

// Construct what we think the test string is
const testText = `Text with \`inline code${closingTag}\` and outside thinking${thinkingClosingTag}.`;

console.log("Test string:", JSON.stringify(testText));
console.log("Length:", testText.length);

// Check if this contains what the test expects
const expectedContent = "inline code";
console.log("Contains expected content:", testText.includes(expectedContent));

// Let's manually check what the test might be looking for
const expectedWithSpecialChar = "inline code";
console.log("Contains expected with special char:", testText.includes(expectedWithSpecialChar));

// Check character by character around the inline code part
const inlineStart = testText.indexOf("inline code");
if (inlineStart !== -1) {
  console.log("\nCharacters around 'inline code':");
  for (let i = inlineStart - 2; i < inlineStart + "inline code".length + 5; i++) {
    if (i >= 0 && i < testText.length) {
      const char = testText[i];
      const code = char.charCodeAt(0);
      const isSpecial = code > 127 || char === "<" || char === ">";
      console.log(`  [${i}]: "${char}" (${code})${isSpecial ? " - SPECIAL" : ""}`);
    }
  }
}
