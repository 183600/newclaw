const { stripReasoningTagsFromText } = require("./dist/shared/text/reasoning-tags.js");

// Test 1: Simple thinking tags
console.log("Test 1: Simple thinking tags");
const test1 = "Before This is thinking\u0111 after.";
const result1 = stripReasoningTagsFromText(test1);
console.log("Input:", JSON.stringify(test1));
console.log("Output:", JSON.stringify(result1));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result1 === "Before  after.");
console.log("");

// Test 2: Multiple thinking blocks
console.log("Test 2: Multiple thinking blocks");
const test2 = "Start First thought\u0111 middle Second thought\u0111 end.";
const result2 = stripReasoningTagsFromText(test2);
console.log("Input:", JSON.stringify(test2));
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", JSON.stringify("Start  middle  end."));
console.log("Match:", result2 === "Start  middle  end.");
console.log("");

// Test 3: Final tags
console.log("Test 3: Final tags");
const test3 = "Before <final>Final answer</final> after.";
const result3 = stripReasoningTagsFromText(test3);
console.log("Input:", JSON.stringify(test3));
console.log("Output:", JSON.stringify(result3));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result3 === "Before  after.");
console.log("");

// Test 4: Trim options
console.log("Test 4: Trim options");
const test4 = "  Before thinking\u0111 after  ";
const resultNone = stripReasoningTagsFromText(test4, { trim: "none" });
const resultStart = stripReasoningTagsFromText(test4, { trim: "start" });
const resultBoth = stripReasoningTagsFromText(test4, { trim: "both" });
console.log("Input:", JSON.stringify(test4));
console.log("Result (none):", JSON.stringify(resultNone));
console.log("Expected (none):", JSON.stringify("  Before  after  "));
console.log("Match (none):", resultNone === "  Before  after  ");
console.log("Result (start):", JSON.stringify(resultStart));
console.log("Expected (start):", JSON.stringify("Before  after  "));
console.log("Match (start):", resultStart === "Before  after  ");
console.log("Result (both):", JSON.stringify(resultBoth));
console.log("Expected (both):", JSON.stringify("Before  after."));
console.log("Match (both):", resultBoth === "Before  after.");
