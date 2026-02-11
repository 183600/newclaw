// Let's find the exact special characters in the test string
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Finding special characters ===\n");

// Find all special characters
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  if (code === 0x0111 || code === 0x0110) {
    const start = Math.max(0, i - 10);
    const end = Math.min(text.length, i + 10);
    console.log(`Position ${i}: "${char}" (code: ${code})`);
    console.log(`Context: "${text.substring(start, end)}"`);
    console.log(`Hex code: 0x${code.toString(16)}`);
    console.log("");
  }
}

// Now let's test the function with this exact string
console.log("=== Testing with exact string ===");
console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));

// Check what the test expects
console.log("\n=== Test expectations ===");
console.log(
  'expect(result).toContain("This should be preserved"):',
  result.includes("This should be preserved"),
);
console.log(
  'expect(result).not.toContain("This should be removed"):',
  !result.includes("This should be removed"),
);

// The test failure shows the result contains "This should be removed"
// But our function should have removed it if there's a special character

// Let's check what words have special characters
const words = text.split(/\s+/);
console.log("\n=== Words with special characters ===");
for (const word of words) {
  if (word.includes("") || word.includes("Đ")) {
    console.log(`"${word}"`);
  }
}

// Let's manually check what happens
console.log("\n=== Manual check ===");
const removedIndex = text.indexOf("removed");
if (removedIndex !== -1) {
  const context = text.substring(removedIndex - 5, removedIndex + 15);
  console.log('Context around "removed":', JSON.stringify(context));

  // Check if there's a special character after "removed"
  const afterRemoved = text.substring(removedIndex + "removed".length);
  console.log('After "removed":', JSON.stringify(afterRemoved));
  console.log(
    'First char after "removed":',
    afterRemoved[0],
    `code: ${afterRemoved[0]?.charCodeAt(0)}`,
  );
}
