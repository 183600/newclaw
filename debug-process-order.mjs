import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

const original = "&#x110;thinking &#x110;nested thinking&#x111; thinking&#x111;";
console.log("Original:", original);

// Step 1: Convert HTML entities
let step1 = original.replace(/&#x110;thinking/g, "Đthinking");
step1 = step1.replace(/&#x110;nested thinking/g, "Đnested thinking");
step1 = step1.replace(/thinking&#x111;/g, "thinkingđ");
console.log("After HTML entity conversion:", step1);

// Step 2: Apply stripReasoningTagsFromText
const result = stripReasoningTagsFromText(original);
console.log("Final result:", result);
