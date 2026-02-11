// Simple test to check what the function actually returns
import { stripReasoningTagsFromText } from './src/shared/text/reasoning-tags.ts';

// Test the exact string from the test file
const testText = 'Text with `inline code
` and outside thinking.';

console.log("Input:", JSON.stringify(testText));
const result = stripReasoningTagsFromText(testText);
console.log("Output:", JSON.stringify(result));
console.log("Contains 'inline code
':", result.includes('inline code
'));
console.log("Contains 'inline code':", result.includes('inline code'));

// Check what characters are actually in the result
console.log("\nCharacter analysis of result:");
for (let i = 0; i < result.length; i++) {
  const char = result[i];
  const code = char.charCodeAt(0);
  if (code > 127 || char === '<' || char === '>') {
    console.log(`  [${i}]: "${char}" (${code}) - SPECIAL`);
  }
}

// Let's also check what the test is actually looking for
const targetText = 'inline code
';
console.log("\nTarget text:", JSON.stringify(targetText));
console.log("Target character codes:");
for (let i = 0; i < targetText.length; i++) {
  const char = targetText[i];
  const code = char.charCodeAt(0);
  console.log(`  [${i}]: "${char}" (${code})`);
}