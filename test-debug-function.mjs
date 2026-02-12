import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test the exact cases from the test file
console.log("=== Testing exact test cases ===");

// Test case 1: Simple thinking tag
const test1 = "Before This is thinkingđ after.";
console.log("Test 1 input:", test1);
const result1 = stripReasoningTagsFromText(test1);
console.log("Test 1 output:", result1);
console.log("Test 1 expected:", "Before  after.");
console.log("Test 1 match:", result1 === "Before  after.");

// Test case 2: Multiple thinking blocks
const test2 = "Start First thoughtđ middle Second thoughtđ end.";
console.log("\nTest 2 input:", test2);
const result2 = stripReasoningTagsFromText(test2);
console.log("Test 2 output:", result2);
console.log("Test 2 expected:", "Start  middle  end.");
console.log("Test 2 match:", result2 === "Start  middle  end.");

// Test case 3: Unclosed opening tag (preserve mode)
const test3 = "Before ĐthinkingUnclosed thinking content";
console.log("\nTest 3 input:", test3);
console.log("Test 3 has Đthinking character:", test3.includes("Đthinking"));
const result3 = stripReasoningTagsFromText(test3, { mode: "preserve" });
console.log("Test 3 output:", result3);
console.log("Test 3 expected:", "Unclosed thinking content");
console.log("Test 3 match:", result3 === "Unclosed thinking content");

// Test case 4: Unclosed opening tag (strict mode)
const test4 = "Before ĐthinkingUnclosed thinking content";
console.log("\nTest 4 input:", test4);
const result4 = stripReasoningTagsFromText(test4, { mode: "strict" });
console.log("Test 4 output:", result4);
console.log("Test 4 expected:", "Before");
console.log("Test 4 match:", result4 === "Before ");
