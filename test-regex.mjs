// Test the regex directly
const text = "Text with `inline code`đ and outside thinkingđ.";
const inlineRe = /`([^`]+)`/g;

console.log("Text:", JSON.stringify(text));
console.log("Testing regex: `([^`]+)`");

for (const match of text.matchAll(inlineRe)) {
  console.log("Match found:", {
    full: match[0],
    group: match[1],
    index: match.index,
    length: match[0].length,
  });
}

// Let's also test character by character
console.log("\nCharacter analysis:");
for (let i = 0; i < text.length; i++) {
  if (text[i] === "`" || text.charCodeAt(i) === 273) {
    console.log(`Position ${i}: '${text[i]}' (code ${text.charCodeAt(i)})`);
  }
}
