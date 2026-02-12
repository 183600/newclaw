// Debug HTML entity conversion step by step
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// Test HTML entity conversion
const testText = "This should be preserved&#x111; and this should be removed&#x111;";

console.log("=== HTML Entity Conversion Test ===");
console.log("Input:", JSON.stringify(testText));

// Test the regex patterns directly
const pattern1 = /(\w+)&#x111;/g;
const pattern2 = /&#x110;(\w+)/g;

console.log("\nTesting pattern1 (\w+&#x111;):");
const matches1 = [...testText.matchAll(pattern1)];
console.log("Matches:", matches1);

console.log("\nTesting pattern2 (&#x110;\w+):");
const matches2 = [...testText.matchAll(pattern2)];
console.log("Matches:", matches2);

// Test replacement
const replaced1 = testText.replace(pattern1, "$1đ");
console.log("\nAfter pattern1 replacement:", JSON.stringify(replaced1));

const replaced2 = replaced1.replace(pattern2, "Đ$1");
console.log("After pattern2 replacement:", JSON.stringify(replaced2));

// Test with the actual function
console.log("\n=== Full Function Test ===");
const result = stripReasoningTagsFromText(testText);
console.log("Function output:", JSON.stringify(result));
console.log('Contains "preserved":', result.includes("preserved"));
console.log('Contains "removed":', result.includes("removed"));
