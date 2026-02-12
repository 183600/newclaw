// Test with exact text from test file

const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Text 1:");
console.log(JSON.stringify(text1));
console.log("Length:", text1.length);
console.log("Char at position 38:", text1.charAt(38), text1.charCodeAt(38));

// Test if the character is indeed
const preservedIndex = text1.indexOf("preserved");
console.log('Index of "preserved":', preservedIndex);
console.log(
  'Character after "preserved":',
  text1.charAt(preservedIndex + 9),
  text1.charCodeAt(preservedIndex + 9),
);

const removedIndex = text1.indexOf("removed");
console.log('Index of "removed":', removedIndex);
console.log(
  'Character after "removed":',
  text1.charAt(removedIndex + 7),
  text1.charCodeAt(removedIndex + 7),
);

// Test regex
const pattern = /\w+\u0111/g;
console.log("\nTesting pattern \w+:");
const matches = text1.match(pattern);
console.log("Matches:", matches);

const text2 = "Text with \`inline code\` and outside thinking.";
console.log("\nText 2:");
console.log(JSON.stringify(text2));
console.log("Length:", text2.length);

const inlineIndex = text2.indexOf("inline");
console.log('Index of "inline":', inlineIndex);
console.log(
  'Character after "inline":',
  text2.charAt(inlineIndex + 6),
  text2.charCodeAt(inlineIndex + 6),
);

const thinkingIndex = text2.indexOf("thinking");
console.log('Index of "thinking":', thinkingIndex);
console.log(
  'Character after "thinking":',
  text2.charAt(thinkingIndex + 8),
  text2.charCodeAt(thinkingIndex + 8),
);

console.log("\nTesting pattern \w+:");
const matches2 = text2.match(pattern);
console.log("Matches:", matches2);
