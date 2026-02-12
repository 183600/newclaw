// Debug with actual test data
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test 1 - using actual chars from test file
const text1 = "Before This is thinking\u0111 after."; // \u0111 is đ
console.log("=== Test 1 ===");
console.log("Input:", JSON.stringify(text1));
const result1 = stripReasoningTagsFromText(text1);
console.log("Output:", JSON.stringify(result1));
console.log("Expected:", JSON.stringify("Before  after."));
console.log("Match:", result1 === "Before  after.");

// Test 2
const text2 = "Start First thought\u0111 middle Second thought\u0111 end.";
console.log("\n=== Test 2 ===");
console.log("Input:", JSON.stringify(text2));
const result2 = stripReasoningTagsFromText(text2);
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", JSON.stringify("Start  middle  end."));
console.log("Match:", result2 === "Start  middle  end.");
