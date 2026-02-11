// Let's test the actual behavior with the exact test inputs
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test 2: Inline code
console.log("=== Test 2: Inline code ===");
// From the error: expected 'Text with `inline code` a…' to contain 'inline code'
// This means the input is "Text with `inline code` and outside thinking"
// And the result is "Text with `inline code` and ."

const test2 = "Text with `inline code` and outside thinking";
console.log("Input:", JSON.stringify(test2));
const result2 = stripReasoningTagsFromText(test2);
console.log("Output:", JSON.stringify(result2));
console.log('Contains "inline code":', result2.includes("inline code"));
console.log('Contains "inline code":', result2.includes("inline code"));
console.log('Contains "thinking":', result2.includes("thinking"));
console.log('Contains "thinking":', result2.includes("thinking"));

// The function should remove "thinking" when followed by special character
// But it seems to be removing the entire phrase "outside thinking"

// Test 3: Unclosed thinking - preserve mode
console.log("\n=== Test 3: Unclosed thinking - preserve mode ===");
// From the error: expected 'Before Unclosed thinking content' to be 'Unclosed thinking content'
// This means the input is "Before Unclosed thinking content"
// And the result is "Before Unclosed thinking content"

const test3 = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(test3));
const result3 = stripReasoningTagsFromText(test3, { mode: "preserve" });
console.log("Output (preserve):", JSON.stringify(result3));
console.log('Expected: "Unclosed thinking content"');
console.log("Actual matches expected:", result3 === "Unclosed thinking content");

// Test 4: Unclosed thinking - strict mode
console.log("\n=== Test 4: Unclosed thinking - strict mode ===");
const result4 = stripReasoningTagsFromText(test3, { mode: "strict" });
console.log("Output (strict):", JSON.stringify(result4));
console.log('Expected: "Before "');
console.log("Actual matches expected:", result4 === "Before ");

// Test 5: Trim options
console.log("\n=== Test 5: Trim options ===");
// From the error: expected '   after  ' to be '  Before  after  '
// This means the input is "  Before thinking after  "
// And the result is "   after  "

const test5 = "  Before thinking after  ";
console.log("Input:", JSON.stringify(test5));
const result5 = stripReasoningTagsFromText(test5, { trim: "none" });
console.log("Output (none):", JSON.stringify(result5));
console.log('Expected: "  Before  after  "');
console.log("Actual matches expected:", result5 === "  Before  after  ");

console.log("\n=== Analysis ===");
console.log("The function is not correctly handling these cases:");
console.log('1. It should remove "thinking" when followed by special character');
console.log("2. It should extract content after unclosed Đthinking tags");
console.log("3. It should remove content after unclosed Đthinking tags in strict mode");
console.log("4. It should remove special characters while preserving surrounding text");
console.log("");
console.log("The function needs to be updated to handle these specific cases.");
