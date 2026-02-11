// Test why test1 is not detecting tags
const FIXED_QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[đĐ]|(?:Đ)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/i;

const test1 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Test 1:", JSON.stringify(test1));
console.log("Matches:", FIXED_QUICK_TAG_RE.test(test1));

// Let's check character by character
for (let i = 0; i < test1.length; i++) {
  if (test1[i] === "đ" || test1[i] === "Đ") {
    console.log(`Found "${test1[i]}" at position ${i}`);
    // Check surrounding context
    const start = Math.max(0, i - 10);
    const end = Math.min(test1.length, i + 10);
    console.log(`Context: "${test1.substring(start, end)}"`);

    // Check if it matches the pattern
    const substr = test1.substring(i - 10, i + 1);
    console.log(`Before đ: "${substr}"`);
    if (/(?:\w+)[đ]/i.test(substr + "đ")) {
      console.log("Matches pattern!");
    }
  }
}

// Test the pattern directly
console.log("\n=== Direct pattern tests ===");
console.log('"preservedđ" matches:', /(?:\w+)[đ]/i.test("preservedđ"));
console.log('"removedđ" matches:', /(?:\w+)[đ]/i.test("removedđ"));
console.log('"should be removedđ" matches:', /(?:\w+)[đ]/i.test("should be removedđ"));

// Test with word boundary
console.log("\n=== With word boundary ===");
console.log('"preservedđ" matches:', /\b\w+[đ]/i.test("preservedđ"));
console.log('"should be removedđ" matches:', /\b\w+[đ]/i.test("should be removedđ"));
