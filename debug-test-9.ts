import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags";

// Test the actual test case with special characters
const text = `Text with \`inline code${String.fromCharCode(273)}\` and outside thinking${String.fromCharCode(273)}.`;
console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));
console.log('Contains "inline code":', result.includes("inline code"));
console.log('Contains "inline code":', result.includes(`inline code${String.fromCharCode(273)}`));
console.log('Contains "thinking":', result.includes("thinking"));
console.log('Contains "thinking":', result.includes(`thinking${String.fromCharCode(273)}`));

// What the test expects
console.log("\nTest expects:");
console.log('- Contains "inline code":', result.includes(`inline code${String.fromCharCode(273)}`));
console.log(
  '- Does NOT contain "thinking":',
  !result.includes(`thinking${String.fromCharCode(273)}`),
);
