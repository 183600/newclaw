// Debug the test case
const testStr = "a🌟b";
console.log("String:", testStr);
console.log("Length:", testStr.length);
console.log("Char codes:");
for (let i = 0; i < testStr.length; i++) {
  const code = testStr.charCodeAt(i);
  const isHigh = code >= 0xd800 && code <= 0xdbff;
  const isLow = code >= 0xdc00 && code <= 0xdfff;
  console.log(`  [${i}] code=${code} (0x${code.toString(16)}) high=${isHigh} low=${isLow}`);
}

console.log("\nTest case: sliceUtf16Safe('a🌟b', 2, 3)");
console.log("from=2 points to:", testStr[2]);
console.log("to=3 points to:", testStr[3]);

// Expected behavior based on test:
// sliceUtf16Safe("a🌟b", 2, 3) should return "b"
// This means:
// - from=2 (low surrogate) should be adjusted to 3
// - to=3 (low surrogate) should be adjusted to 4
// - Result: slice(3, 4) = "b"

console.log("\nExpected slice(3, 4):", testStr.slice(3, 4));
