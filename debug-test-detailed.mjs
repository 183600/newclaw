import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test only opening tags
console.log("Only Opening Tags Test");
const onlyOpeningText = "Before <thinking>content after.";
const result1 = stripReasoningTagsFromText(onlyOpeningText, { mode: "strict" });
console.log("Input:", onlyOpeningText);
console.log("Output:", result1);
console.log("Expected: Before ");
console.log("Match:", result1 === "Before ");

// Test only closing tags
console.log("\nOnly Closing Tags Test");
const onlyClosingText = "Before content</thinking> after.";
const result2 = stripReasoningTagsFromText(onlyClosingText);
console.log("Input:", onlyClosingText);
console.log("Output:", result2);
console.log("Expected: Before  after.");
console.log("Match:", result2 === "Before  after.");

// Test overlapping ranges
console.log("\nOverlapping Ranges Test");
const overlappingText = "Before Đthinking nested <thinking>content</thinking> thinkingđ after.";
const result3 = stripReasoningTagsFromText(overlappingText);
console.log("Input:", overlappingText);
console.log("Output:", result3);
console.log("Expected: Before   after.");
console.log("Match:", result3 === "Before   after.");

// Test mixed format tags
console.log("\nMixed Format Tags Test");
const mixedFormatText =
  "Before <thinking>HTML content</thinking> and Đthinking special content thinkingđ after.";
const result4 = stripReasoningTagsFromText(mixedFormatText);
console.log("Input:", mixedFormatText);
console.log("Output:", result4);
console.log("Expected: Before   and   after.");
console.log("Match:", result4 === "Before   and   after.");
