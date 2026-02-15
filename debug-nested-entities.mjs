import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const text = "&#x110;thinking &#x110;nested thinking&#x111; thinking&#x111;";
const result = stripReasoningTagsFromText(text);
console.log("Original:", text);
console.log("Result:", result);
console.log("Expected:", "");
