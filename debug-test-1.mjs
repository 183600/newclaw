import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Debug the first failing test case
const text = "Before <thinking>unclosed <thought>nested</thinking> after";
console.log("Input:", JSON.stringify(text));
console.log("Expected:", JSON.stringify("Before  after"));

const result = stripReasoningTagsFromText(text);
console.log("Actual:", JSON.stringify(result));

// Let's also test with strict mode explicitly
const resultStrict = stripReasoningTagsFromText(text, { mode: "strict" });
console.log("Actual (strict):", JSON.stringify(resultStrict));
