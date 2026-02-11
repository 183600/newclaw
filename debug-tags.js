// Check the actual characters in the test
const test3 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

// Let's manually add the tags to test
const testWithTags = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed
 code block.`;

console.log("Test with tags:");
console.log(testWithTags);

// Check for the actual tags
const thinkingTag = "preserved";
const removedTag = "removed";

console.log("\nLooking for actual tags...");
for (let i = 0; i < testWithTags.length; i++) {
  if (testWithTags.substring(i, i + thinkingTag.length) === thinkingTag) {
    console.log(`Found "${thinkingTag}" at index ${i}`);
    console.log(
      "Context:",
      testWithTags.substring(
        Math.max(0, i - 5),
        Math.min(testWithTags.length, i + thinkingTag.length + 5),
      ),
    );
  }
  if (testWithTags.substring(i, i + removedTag.length) === removedTag) {
    console.log(`Found "${removedTag}" at index ${i}`);
    console.log(
      "Context:",
      testWithTags.substring(
        Math.max(0, i - 5),
        Math.min(testWithTags.length, i + removedTag.length + 5),
      ),
    );
  }
}
