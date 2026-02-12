import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "Text with \\`inline code</arg_value>\\` and outside thinking</think>.";
const expected = "inline code</think>";

console.log("Input:", JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify(expected));
console.log("Contains expected:", result.includes(expected));
