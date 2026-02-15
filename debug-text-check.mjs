// Test the actual text
const text = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Text:");
console.log(JSON.stringify(text));
console.log("----------");

// Check if it contains "thinkingđ"
console.log("Contains 'thinkingđ':", text.includes("thinkingđ"));

// Check each character
for (let i = 0; i < text.length; i++) {
  if (text[i] === "đ") {
    console.log(`Found 'đ' at position ${i}`);
    console.log(`Context: "${text.slice(Math.max(0, i - 10), i + 10)}"`);
  }
}
