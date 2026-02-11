// Let's check what the actual QUICK_TAG_RE matches
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[đĐ]|(?:Đ)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

function testRegex(text) {
  console.log(`Testing: "${text}"`);
  const matches = [...text.matchAll(QUICK_TAG_RE)];
  console.log("Matches:", matches);
  console.log("Test result:", QUICK_TAG_RE.test(text));
  console.log("---");
}

// Test various patterns
testRegex("First thoughtđ middle");
testRegex("This should be removedđ");
testRegex("should be removedđ");
testRegex("removedđ");
testRegex("thinkingđ");
testRegex("thoughtđ");

// Let's also test the actual patterns in the function
console.log("\n=== Testing individual components ===");
const pattern1 = /(?:thinking|thought|antthinking)[đĐ]/i;
console.log('"should be removedđ" matches pattern1:', pattern1.test("should be removedđ"));
console.log('"removedđ" matches pattern1:', pattern1.test("removedđ"));

const pattern2 = /\b(thinking|thought|antthinking)/i;
console.log('"should be removed" matches pattern2:', pattern2.test("should be removed"));
console.log('"removed" matches pattern2:', pattern2.test("removed"));
console.log('"thinking" matches pattern2:', pattern2.test("thinking"));

// Test the full pattern with word boundary
const pattern3 =
  /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/i;
console.log('"thinking</t>" matches pattern3:', pattern3.test("thinking</t>"));
console.log('"removed</t>" matches pattern3:', pattern3.test("removed</t>"));
