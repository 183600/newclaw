// Test with actual tags from the hex dump
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
console.log("Length:", test3.length);

// Check for the actual tags
console.log("\nLooking for actual tags...");
for (let i = 0; i < test3.length; i++) {
  const substring = test3.substring(i, i + "preserved".length);
  if (substring === "preserved") {
    console.log(`Found "preserved" at index ${i}`);
    console.log("Next 10 chars:", test3.substring(i, Math.min(test3.length, i + 20)));
  }
  if (test3.substring(i, i + "removed".length) === "removed") {
    console.log(`Found "removed" at index ${i}`);
    console.log("Next 10 chars:", test3.substring(i, Math.min(test3.length, i + 20)));
  }
}

// Check for closing tags
console.log("\nLooking for closing tags...");
for (let i = 0; i < test3.length; i++) {
  if (test3.substring(i, i + "</think>".length) === "</think>") {
    console.log(`Found "</think>" at index ${i}`);
    console.log("Before 5 chars:", test3.substring(Math.max(0, i - 5), i));
  }
}
