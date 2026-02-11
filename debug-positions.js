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

console.log("\nTest 3 length:", test3.length);
console.log("Test 3:", test3);

// Find the exact positions of the tags
const preservedIndex = test3.indexOf(tag1);
const removedIndex = test3.indexOf(tag2);

console.log("\nTag positions:");
console.log("preserved tag at index:", preservedIndex);
console.log("removed tag at index:", removedIndex);

// Check context around each tag
if (preservedIndex !== -1) {
  console.log("\nContext around preserved tag:");
  console.log("Before:", test3.substring(Math.max(0, preservedIndex - 10), preservedIndex));
  console.log(
    "After:",
    test3.substring(
      preservedIndex + tag1.length,
      Math.min(test3.length, preservedIndex + tag1.length + 10),
    ),
  );
}

if (removedIndex !== -1) {
  console.log("\nContext around removed tag:");
  console.log("Before:", test3.substring(Math.max(0, removedIndex - 10), removedIndex));
  console.log(
    "After:",
    test3.substring(
      removedIndex + tag2.length,
      Math.min(test3.length, removedIndex + tag2.length + 10),
    ),
  );
}

// Test if our QUICK_TAG_RE matches
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/gi;
console.log("\nQUICK_TAG_RE matches:", QUICK_TAG_RE.test(test3));

// Check for matches
const matches = [...test3.matchAll(QUICK_TAG_RE)];
console.log("Matches:", matches);
