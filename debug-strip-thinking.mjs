// Test stripThinkingTagsFromText directly
import { stripThinkingTagsFromText } from "./src/agents/pi-embedded-utils.js";

console.log("Testing stripThinkingTagsFromText:");

const test1 = "Hi ";
console.log(`Input: "${test1}"`);
console.log(`Output: "${stripThinkingTagsFromText(test1)}"`);

const test2 = "thinking&#x111;secret&#x111;there";
console.log(`\nInput: "${test2}"`);
console.log(`Output: "${stripThinkingTagsFromText(test2)}"`);

// Let's trace through what happens
console.log("\n--- Tracing test2 ---");
let result = test2;
console.log(`Step 1 - Original: "${result}"`);

// Convert HTML entities
result = result.replace(/thinking&#x111;/g, "thinkingđ");
result = result.replace(/thought&#x111;/g, "thoughtđ");
result = result.replace(/&#x110;thinking/g, "Đthinking");
result = result.replace(/&#x110;thought/g, "Đthought");
console.log(`Step 2 - After HTML entity conversion: "${result}"`);

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

// Trim
result = result.trim();
console.log(`Step 6 - After trim: "${result}"`);

console.log(`\nExpected: "there" (since "thinking&#x111;secret&#x111;" should be removed)`);
console.log(`Got: "${result}"`);
