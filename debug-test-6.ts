import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Test with the actual test case from the test file
const testText1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Test Case 1 ===");
console.log("Input:");
console.log(JSON.stringify(testText1));
console.log("\nOutput:");
const result1 = stripReasoningTagsFromText(testText1);
console.log(JSON.stringify(result1));
console.log(
  '\nExpected: Contains "This should be preserved"',
  result1.includes("This should be preserved"),
);
console.log(
  'Expected: Does NOT contain "This should be removed"',
  !result1.includes("This should be removed"),
);

// Test inline code case
const testText2 = "Text with \`inline code\` and outside thinking.";
console.log("\n=== Test Case 2 ===");
console.log("Input:");
console.log(JSON.stringify(testText2));
console.log("\nOutput:");
const result2 = stripReasoningTagsFromText(testText2);
console.log(JSON.stringify(result2));
console.log('\nExpected: Contains "inline code"', result2.includes("inline code"));
console.log('Expected: Does NOT contain "thinking"', !result2.includes("thinking"));

// Test character analysis
console.log("\n=== Character Analysis ===");
const charCode = 273; // Unicode for
console.log(`Character code 273: ${String.fromCharCode(273)}`);
const charCode2 = 272; // Unicode for
console.log(`Character code 272: ${String.fromCharCode(272)}`);

// Check if the test input actually contains these characters
console.log("\n=== Checking test input ===");
const testWithSpecial = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

for (let i = 0; i < testWithSpecial.length; i++) {
  const code = testWithSpecial.charCodeAt(i);
  if (code === 273 || code === 272) {
    console.log(`Found special character at position ${i}: ${testWithSpecial[i]} (code: ${code})`);
  }
}
