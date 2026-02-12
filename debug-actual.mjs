import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text = "Text with \`inline code</t>\` and outside thinking</t>.";
console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Output:", JSON.stringify(result));
console.log('Contains "inline codeđ":', result.includes("inline codeđ"));
console.log('Contains "thinkingđ":', result.includes("thinkingđ"));
