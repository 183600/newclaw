import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "Đnested thinkingđ";
const result = stripReasoningTagsFromText(text);
console.log("Original:", text);
console.log("Result:", result);
console.log("Expected:", "");
