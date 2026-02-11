// Import the stripReasoningTagsFromText function
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Create the exact test case with actual thinking tags
const hex1 = "7072657365727665643c2f7468696e6b3e"; // preserved</thinking>
const hex2 = "72656d6f7665643c2f7468696e6b3e"; // removed</thinking>

// Convert hex to string
const tag1 = Buffer.from(hex1, "hex").toString("utf8");
const tag2 = Buffer.from(hex2, "hex").toString("utf8");

const text = `
\`\`\`javascript
function test() {
  // This should be preserved${tag1}
  return true;
}
\`\`\`
Outside This should be removed${tag2} code block.`;

console.log("Input text:");
console.log(text);

console.log("\nTags:");
console.log("Tag 1:", tag1);
console.log("Tag 2:", tag2);

console.log("\nOutput:");
const result = stripReasoningTagsFromText(text);
console.log(result);

console.log('\nContains "preserved":', result.includes("preserved"));
console.log('Contains "removed":', result.includes("removed"));
