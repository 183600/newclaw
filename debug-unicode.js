import * as funcs from "./dist/image-DOhePNiG.js";

const stripThinkingTagsFromText = funcs.g;

console.log("=== Testing Special Unicode Characters ===");

// Test the exact case from the test
const test1 = "Before This is thinkingđ after.";
const result1 = stripThinkingTagsFromText(test1);
console.log("Test 1 (exact from test):");
console.log("Input:", JSON.stringify(test1));
console.log("Output:", JSON.stringify(result1));
console.log("Expected:", "Before  after.");
console.log("Correct:", result1 === "Before  after.");

// Test with multiple blocks
const test2 = "Start First thoughtđ middle Second thoughtđ end.";
const result2 = stripThinkingTagsFromText(test2);
console.log("\nTest 2 (multiple blocks):");
console.log("Input:", JSON.stringify(test2));
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", "Start  middle  end.");
console.log("Correct:", result2 === "Start  middle  end.");

// Test with HTML
const test3 = "Before<thinking>internal reasoning</thinking>After";
const result3 = stripThinkingTagsFromText(test3);
console.log("\nTest 3 (HTML):");
console.log("Input:", JSON.stringify(test3));
console.log("Output:", JSON.stringify(result3));
console.log("Expected:", "BeforeAfter");
console.log("Correct:", result3 === "BeforeAfter");

// Let's check if the issue is with the Unicode character itself
console.log("\nCharacter analysis:");
console.log("thinking\u0111 length:", "thinking\u0111".length);
console.log(
  "Characters:",
  [..."thinking\u0111"].map((c) => `${c} (${c.charCodeAt(0)})`),
);
