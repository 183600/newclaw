// Test the code block preservation
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

console.log("Original:");
console.log(text);
console.log("----------");

const result = stripReasoningTagsFromText(text);
console.log("Result:");
console.log(result);
console.log("----------");

console.log("Contains preserved:", result.includes("This should be preservedđ"));
console.log("Contains removed:", result.includes("This should be removedđ"));
