import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test 1: Simple thinking tags
const test1 = "Before This is thinking</t> after.";
console.log("Test 1 input:", test1);
console.log("Test 1 output:", stripReasoningTagsFromText(test1));
console.log('Expected: "Before  after."');
console.log("");

// Test 2: Multiple thinking blocks
const test2 = "Start First thought</t> middle Second thought</t> end.";
console.log("Test 2 input:", test2);
console.log("Test 2 output:", stripReasoningTagsFromText(test2));
console.log('Expected: "Start  middle  end."');
console.log("");

// Test 3: Unclosed thinking in preserve mode
const test3 = "Before <thinking>Unclosed thinking content";
console.log("Test 3 input:", test3);
console.log("Test 3 output (preserve):", stripReasoningTagsFromText(test3, { mode: "preserve" }));
console.log('Expected: "Unclosed thinking content"');
console.log("");

// Test 4: Unclosed thinking in strict mode
console.log("Test 4 output (strict):", stripReasoningTagsFromText(test3, { mode: "strict" }));
console.log('Expected: "Before "');
console.log("");
