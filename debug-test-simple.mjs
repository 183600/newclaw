import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test HTML entity opening tags with debug
console.log("HTML Entity Test");
const htmlEntityText = "Before &#x110;thinking content after.";
console.log("Original text:", htmlEntityText);

// Let's manually check the replacement
let step1 = htmlEntityText.replace(/&#x110;thinking/g, "Đthinking");
console.log("After entity replacement:", step1);

// Now let's check if there is a closing tag
console.log("Contains thinkingđ:", step1.includes("thinkingđ"));
console.log("Contains thoughtđ:", step1.includes("thoughtđ"));
console.log("Contains antthinkingđ:", step1.includes("antthinkingđ"));

const result2 = stripReasoningTagsFromText(htmlEntityText);
console.log("Final result:", result2);

// Let's test with a closing tag
const withClosingTag = "Before &#x110;thinking content thinking&#x111; after.";
console.log("\nWith closing tag:");
console.log("Input:", withClosingTag);
const result3 = stripReasoningTagsFromText(withClosingTag);
console.log("Output:", result3);
