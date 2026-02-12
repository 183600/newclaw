// Test with manually created text containing special characters

// Create text with special character using Unicode escape
const text1 = `\n\`\`\`javascript\nfunction test() {\n  // This should be preserved\u0111\n  return true;\n}\n\`\`\`\nOutside This should be removed\u0111 code block.`;

console.log("Text 1:");
console.log(JSON.stringify(text1));
console.log("Contains đ:", text1.includes("\u0111"));

// Test if the character is indeed special
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

// Test unpairedWordTagRe
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
console.log("\nTesting unpairedWordTagRe:");
for (const match of text1.matchAll(unpairedWordTagRe)) {
  console.log("Match:", JSON.stringify(match[0]));
}

// Test pattern that should match
const pattern = /\w+\u0111/g;
console.log("\nTesting pattern \w+đ:");
const matches = text1.match(pattern);
console.log("Matches:", matches);

const text2 = `Text with \`inline code\u0111\` and outside thinking\u0111.`;

console.log("\nText 2:");
console.log(JSON.stringify(text2));
console.log("Contains đ:", text2.includes("\u0111"));

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

console.log("\nTesting unpairedWordTagRe:");
for (const match of text2.matchAll(unpairedWordTagRe)) {
  console.log("Match:", JSON.stringify(match[0]));
}

console.log("\nTesting pattern \w+đ:");
const matches2 = text2.match(pattern);
console.log("Matches:", matches2);
