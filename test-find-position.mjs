// Let's find exactly where the special character is
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Finding special character position ===");

// Find all occurrences of special characters
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  if (code === 0x0111 || code === 0x0110) {
    console.log(`Found special character at position ${i}: "${char}" (code: ${code})`);

    // Show context
    const start = Math.max(0, i - 20);
    const end = Math.min(text.length, i + 20);
    console.log(`Context: "${text.substring(start, end)}"`);

    // Show word boundaries
    let wordStart = i;
    while (wordStart > 0 && /[a-zA-Z]/.test(text[wordStart - 1])) {
      wordStart--;
    }
    let wordEnd = i;
    while (wordEnd < text.length && /[a-zA-Z]/.test(text[wordEnd + 1])) {
      wordEnd++;
    }
    const word = text.substring(wordStart, wordEnd + 1);
    console.log(`Word: "${word}"`);

    // Check if it's part of "preserved" or "removed"
    if (word.includes("preserved")) {
      console.log('Special character is in "preserved"');
    } else if (word.includes("removed")) {
      console.log('Special character is in "removed"');
    }
    console.log("");
  }
}

// Now let's test what happens
console.log("=== Testing function ===");
console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));

// The test expects the result NOT to contain "This should be removed"
// But the result DOES contain it
// This means the special character is not after "removed"
// It must be somewhere else

console.log("\n=== Conclusion ===");
console.log('The special character is not after "removed"');
console.log('So the function does not remove "This should be removed"');
console.log("The test expects it to be removed, but it is not");
console.log("");
console.log("This means either:");
console.log("1. The test expectation is wrong");
console.log("2. The special character is in the wrong place");
console.log("3. The function logic needs to be updated");
