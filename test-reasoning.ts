import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log("Testing code block preservation...");

const testText = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Input:");
console.log(JSON.stringify(testText));
console.log("\nOutput:");
const result = stripReasoningTagsFromText(testText);
console.log(JSON.stringify(result));
console.log("\nContains preserved:", result.includes("This should be preservedđ"));
console.log("Contains removed:", result.includes("This should be removedđ"));
