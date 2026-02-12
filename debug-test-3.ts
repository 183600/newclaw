import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Let's check what the actual test input is
const text = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("Input text:");
console.log(JSON.stringify(text));
console.log("\nCharacter codes:");
for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const code = char.charCodeAt(0);
  if (code < 32 || code > 126) {
    console.log(`Position ${i}: "${char}" (${code})`);
  }
}

// Check for the special characters in the test
const testWithSpecial = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("\n\nTest with special characters:");
console.log("Input:");
console.log(JSON.stringify(testWithSpecial));
console.log("\nOutput:");
const result = stripReasoningTagsFromText(testWithSpecial);
console.log(JSON.stringify(result));

// Check for inline code test
const inlineTest = "Text with \`inline code\` and outside thinking.";
console.log("\n\nInline code test:");
console.log("Input:");
console.log(JSON.stringify(inlineTest));
console.log("\nOutput:");
const inlineResult = stripReasoningTagsFromText(inlineTest);
console.log(JSON.stringify(inlineResult));
