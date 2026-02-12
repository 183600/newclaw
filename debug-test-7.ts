import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Create test strings with the actual special characters from the test
const text1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

console.log("=== Test 1: Code blocks ===");
console.log("Input:");
console.log(JSON.stringify(text1));
console.log("\nOutput:");
const result1 = stripReasoningTagsFromText(text1);
console.log(JSON.stringify(result1));
console.log('\nContains "This should be preserved":', result1.includes("This should be preserved"));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));

// Check if there are any special characters in the input
console.log("\n=== Special Character Check ===");
for (let i = 0; i < text1.length; i++) {
  const code = text1.charCodeAt(i);
  if (code === 273 || code === 272) {
    console.log(`Found special character at position ${i}: "${text1[i]}" (code: ${code})`);
  }
}

// Test inline code
const text2 = "Text with \`inline code\` and outside thinking.";
console.log("\n=== Test 2: Inline code ===");
console.log("Input:");
console.log(JSON.stringify(text2));
console.log("\nOutput:");
const result2 = stripReasoningTagsFromText(text2);
console.log(JSON.stringify(result2));
console.log('\nContains "inline code":', result2.includes("inline code"));
console.log('Contains "thinking":', result2.includes("thinking"));

// Check if there are any special characters in the input
console.log("\n=== Special Character Check for Test 2 ===");
for (let i = 0; i < text2.length; i++) {
  const code = text2.charCodeAt(i);
  if (code === 273 || code === 272) {
    console.log(`Found special character at position ${i}: "${text2[i]}" (code: ${code})`);
  }
}

// Let's manually create strings with special characters
const manualTest1 = `
\`\`\`javascript
function test() {
  // This should be preserved${String.fromCharCode(273)}
  return true;
}
\`\`\`
Outside This should be removed${String.fromCharCode(273)} code block.`;

console.log("\n=== Manual Test 1 (with special chars) ===");
console.log("Input:");
console.log(JSON.stringify(manualTest1));
console.log("\nOutput:");
const manualResult1 = stripReasoningTagsFromText(manualTest1);
console.log(JSON.stringify(manualResult1));
console.log(
  '\nContains "This should be preserved":',
  manualResult1.includes("This should be preserved"),
);
console.log('Contains "This should be removed":', manualResult1.includes("This should be removed"));

const manualTest2 = `Text with \`inline code${String.fromCharCode(273)}\` and outside thinking${String.fromCharCode(273)}.`;
console.log("\n=== Manual Test 2 (with special chars) ===");
console.log("Input:");
console.log(JSON.stringify(manualTest2));
console.log("\nOutput:");
const manualResult2 = stripReasoningTagsFromText(manualTest2);
console.log(JSON.stringify(manualResult2));
console.log('\nContains "inline code":', manualResult2.includes("inline code"));
console.log('Contains "thinking":', manualResult2.includes("thinking"));
