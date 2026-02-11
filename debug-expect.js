// Check what the test actually expects
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

console.log('Test 3 contains "preserved":', test3.includes("preserved"));
console.log('Test 3 contains "removed":', test3.includes("removed"));

// Let's check the exact characters around "preserved" and "removed"
const preservedIndex = test3.indexOf("preserved");
const removedIndex = test3.indexOf("removed");

console.log("\nAround preserved:");
console.log("Before:", test3.substring(Math.max(0, preservedIndex - 10), preservedIndex));
console.log(
  "After:",
  test3.substring(
    preservedIndex + "preserved".length,
    Math.min(test3.length, preservedIndex + "preserved".length + 10),
  ),
);

console.log("\nAround removed:");
console.log("Before:", test3.substring(Math.max(0, removedIndex - 10), removedIndex));
console.log(
  "After:",
  test3.substring(
    removedIndex + "removed".length,
    Math.min(test3.length, removedIndex + "removed".length + 10),
  ),
);

// Check for the actual tags
const thinkingTag = "preserved";
const removedTag = "removed";

console.log("\nLooking for actual tags...");
for (let i = 0; i < test3.length; i++) {
  if (test3.substring(i, i + thinkingTag.length) === thinkingTag) {
    console.log(`Found "${thinkingTag}" at index ${i}`);
    console.log(
      "Context:",
      test3.substring(Math.max(0, i - 5), Math.min(test3.length, i + thinkingTag.length + 5)),
    );
  }
  if (test3.substring(i, i + removedTag.length) === removedTag) {
    console.log(`Found "${removedTag}" at index ${i}`);
    console.log(
      "Context:",
      test3.substring(Math.max(0, i - 5), Math.min(test3.length, i + removedTag.length + 5)),
    );
  }
}
