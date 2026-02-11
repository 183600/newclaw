// Create test with actual tags from hex
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

console.log("Test 3:", test3);
console.log('Contains "preserved</thinking>":', test3.includes("preserved</thinking>"));
console.log('Contains "removed</thinking>":', test3.includes("removed</thinking>"));

// Check for closing tags
console.log("\nLooking for closing tags...");
for (let i = 0; i < test3.length; i++) {
  if (test3.substring(i, i + "</thinking>".length) === "</thinking>") {
    console.log(`Found "</thinking>" at index ${i}`);
    console.log("Before 10 chars:", test3.substring(Math.max(0, i - 10), i));
    console.log(
      "After 10 chars:",
      test3.substring(
        i + "</thinking>".length,
        Math.min(test3.length, i + "</thinking>".length + 10),
      ),
    );
  }
}

// Test if our QUICK_TAG_RE matches
const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
console.log("\nQUICK_TAG_RE matches:", QUICK_TAG_RE.test(test3));
