// Debug the issue
import { stripThinkingTagsFromText } from "./src/agents/pi-embedded-utils.js";

const text = "&#x111;Pensando sobre el problema...";
console.log(`Input: "${text}"`);
console.log(`Output: "${stripThinkingTagsFromText(text)}"`);

// Let's trace through the function
let result = text;
console.log(`\nStep 1 - Original: "${result}"`);

// Convert HTML entities
result = result.replace(/thinking&#x111;/g, "thinkingđ");
result = result.replace(/thought&#x111;/g, "thoughtđ");
result = result.replace(/&#x110;thinking/g, "Đthinking");
result = result.replace(/&#x110;thought/g, "Đthought");
console.log(`Step 2 - After HTML entity conversion: "${result}"`);

// The input is "&#x111;Pensando sobre el problema..."
// This doesn't match any of our patterns, so it won't be removed
// We need to handle standalone &#x111; or &#x110; patterns

// Remove HTML thinking tags
result = result.replace(/<think[^>]*>[\s\S]*?<\/think>/gi, "");
result = result.replace(/<thinking[^>]*>[\s\S]*?<\/thinking>/gi, "");
result = result.replace(/<thought[^>]*>[\s\S]*?<\/thought>/gi, "");
result = result.replace(/<antthinking[^>]*>[\s\S]*?<\/antthinking>/gi, "");
console.log(`Step 3 - After removing HTML tags: "${result}"`);

// Remove special character thinking tags with content
result = result.replace(/Đthinking[\s\S]*?thinkingđ/g, "");
result = result.replace(/Đthought[\s\S]*?thoughtđ/g, "");
console.log(`Step 4 - After removing paired special tags: "${result}"`);

// Remove unclosed special character thinking tags
result = result.replace(/Đthinking[\s\S]*/g, "");
result = result.replace(/Đthought[\s\S]*/g, "");
result = result.replace(/^thinkingđ[\s\S]*/gm, "");
result = result.replace(/^thoughtđ[\s\S]*/gm, "");
console.log(`Step 5 - After removing unclosed special tags: "${result}"`);

// We need to handle standalone &#x111; and &#x110;
result = result.replace(/^&#x111;[\s\S]*/gm, "");
result = result.replace(/^&#x110;[\s\S]*/gm, "");
console.log(`Step 6 - After removing standalone closing tags: "${result}"`);

console.log(`\nFinal result: "${result}"`);
