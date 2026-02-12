import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Test the actual test case
const text = "Text with \`inline code\` and outside thinking.";
console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));
console.log('Contains "inline code":', result.includes("inline code"));
console.log('Contains "inline code":', result.includes("inline code"));
console.log('Contains "thinking":', result.includes("thinking"));
console.log('Contains "thinking":', result.includes("thinking"));

// What the test expects
console.log("\nTest expects:");
console.log('- Contains "inline code":', result.includes("inline code"));
console.log('- Does NOT contain "thinking":', !result.includes("thinking"));
