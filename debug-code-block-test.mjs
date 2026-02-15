import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test case: preserve reasoning tags within fenced code blocks
const testCase = `
Before
\`\`\`
This should be preserved thinking
Even Đthisđ should be preserved
\`\`\`
After thinking`;

console.log("Test case: preserve reasoning tags within fenced code blocks");
console.log("Input:", JSON.stringify(testCase));
const result = stripReasoningTagsFromText(testCase);
console.log("Output:", JSON.stringify(result));
console.log(
  "Contains 'This should be preserved thinking':",
  result.includes("This should be preserved thinking"),
);
console.log(
  "Contains 'Even Đthisđ should be preserved':",
  result.includes("Even Đthisđ should be preserved"),
);
console.log("Contains 'After thinking':", result.includes("After thinking"));
console.log("");

// Test case: preserve reasoning tags within inline code
const testCase2 = "Before \`code with thinking\` after thinking";
console.log("Test case: preserve reasoning tags within inline code");
console.log("Input:", JSON.stringify(testCase2));
const result2 = stripReasoningTagsFromText(testCase2);
console.log("Output:", JSON.stringify(result2));
console.log("Contains 'code with thinking':", result2.includes("code with thinking"));
console.log("Contains 'after thinking':", result2.includes("after thinking"));
console.log("");

// Test case: 'none' trim mode
const testCase3 = "  Before thinking  after  ";
console.log("Test case: 'none' trim mode");
console.log("Input:", JSON.stringify(testCase3));
const result3 = stripReasoningTagsFromText(testCase3, { trim: "none" });
console.log("Output:", JSON.stringify(result3));
console.log("Expected:", JSON.stringify("  Before   after  "));
console.log("Match:", result3 === "  Before   after  ");
console.log("");

// Test case: 'start' trim mode
const testCase4 = "  Before thinking  after  ";
console.log("Test case: 'start' trim mode");
console.log("Input:", JSON.stringify(testCase4));
const result4 = stripReasoningTagsFromText(testCase4, { trim: "start" });
console.log("Output:", JSON.stringify(result4));
console.log("Expected:", JSON.stringify("Before   after  "));
console.log("Match:", result4 === "Before   after  ");
console.log("");

// Test case: zero-width characters
const testCase5 = "Before\u200Bthinking\u200Bafter";
console.log("Test case: zero-width characters");
console.log("Input:", JSON.stringify(testCase5));
const result5 = stripReasoningTagsFromText(testCase5);
console.log("Output:", JSON.stringify(result5));
console.log("Expected:", JSON.stringify("Before\u200B\u200Bafter"));
console.log("Match:", result5 === "Before\u200B\u200Bafter");
console.log("");

// Test case: Hebrew characters
const testCase6 = "Before thinkingאחרי";
console.log("Test case: Hebrew characters");
console.log("Input:", JSON.stringify(testCase6));
const result6 = stripReasoningTagsFromText(testCase6, { trim: "both" });
console.log("Output:", JSON.stringify(result6));
console.log("Expected:", JSON.stringify("Before אחרי"));
console.log("Match:", result6 === "Before אחרי");
console.log("");

// Test case: HTML entities
const testCase7 = "Before thinking&#x123;after";
console.log("Test case: HTML entities");
console.log("Input:", JSON.stringify(testCase7));
const result7 = stripReasoningTagsFromText(testCase7, { trim: "both" });
console.log("Output:", JSON.stringify(result7));
console.log("Expected:", JSON.stringify("Before &#x123;after"));
console.log("Match:", result7 === "Before &#x123;after");
console.log("");

// Test case: only reasoning tags
const testCase8 = "thinking";
console.log("Test case: only reasoning tags");
console.log("Input:", JSON.stringify(testCase8));
const result8 = stripReasoningTagsFromText(testCase8);
console.log("Output:", JSON.stringify(result8));
console.log("Expected:", JSON.stringify(""));
console.log("Match:", result8 === "");
console.log("");

// Test case: only special character tags
const testCase9 = "Đthinkingđ";
console.log("Test case: only special character tags");
console.log("Input:", JSON.stringify(testCase9));
const result9 = stripReasoningTagsFromText(testCase9);
console.log("Output:", JSON.stringify(result9));
console.log("Expected:", JSON.stringify(""));
console.log("Match:", result9 === "");
console.log("");
