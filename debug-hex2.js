// Create test with actual tags from hex
const hex1 = "7072657365727665643c2f7468696e6b3e"; // preserved</thinking>
const hex2 = "72656d6f7665643c2f7468696e6b3e"; // removed</thinking>

// Convert hex to string
const tag1 = Buffer.from(hex1, "hex").toString("utf8");
const tag2 = Buffer.from(hex2, "hex").toString("utf8");

console.log("Tag 1:", tag1);
console.log("Tag 2:", tag2);

// Create test with these tags
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved${tag1}
  return true;
}
\`\`\`
Outside This should be removed${tag2} code block.`;

console.log("\nTest 3:", test3);
console.log("Contains tag1:", test3.includes(tag1));
console.log("Contains tag2:", test3.includes(tag2));

// Test if our QUICK_TAG_RE matches
const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/gi;
console.log("\nQUICK_TAG_RE matches:", QUICK_TAG_RE.test(test3));

// Check for matches
const matches = [...test3.matchAll(QUICK_TAG_RE)];
console.log("Matches:", matches);
