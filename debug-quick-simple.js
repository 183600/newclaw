// Check if QUICK_TAG_RE is detecting the text correctly
const thinkingTag = String.fromCharCode(116, 104, 105, 110, 107); // "think"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "

const testText = `Start${thinkingTag}${closingTag}first thought
Middle${thinkingTag}${closingTag}second thought
End`;

console.log("Test text:", JSON.stringify(testText));

// Test QUICK_TAG_RE
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("QUICK_TAG_RE test:", QUICK_TAG_RE.test(testText));

// Test what QUICK_TAG_RE matches by adding global flag
const QUICK_TAG_RE_GLOBAL =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nQUICK_TAG_RE matches:");
for (const match of testText.matchAll(QUICK_TAG_RE_GLOBAL)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
}

// The issue might be that QUICK_TAG_RE is not matching, so the function returns early
// Let's check what we need to match

const firstPart = "first thought\n";
const secondPart = "second thought\n";

console.log("\nChecking individual parts:");
console.log("first part:", JSON.stringify(firstPart));
console.log("second part:", JSON.stringify(secondPart));

// These should match the pattern: word + thinking/thought/antthinking + closing tag
// But they don't have the closing tag in the right place

// The issue is that the text is "first thought\n" where the closing tag is on a new line
// But our regex expects the closing tag to be immediately after the word

// Let's check the actual structure
console.log("\nActual structure analysis:");
const lines = testText.split("\n");
lines.forEach((line, index) => {
  console.log(`Line ${index}:`, JSON.stringify(line));
});
