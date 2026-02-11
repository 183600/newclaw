// Let's test how the test file is actually parsed
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test 1: Code blocks - the actual test from the file
const test1 = `
\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;

// The test runner will parse the escape sequences
const actualTest1 = test1.replace("preserved", "preservedđ").replace("removed", "removedđ");

console.log("=== Test 1: Code blocks ===");
console.log("Input:", JSON.stringify(actualTest1));
const result1 = stripReasoningTagsFromText(actualTest1);
console.log("Output:", JSON.stringify(result1));
console.log('Contains "This should be preserved":', result1.includes("This should be preserved"));
console.log('Contains "This should be removed":', result1.includes("This should be removed"));
console.log('Contains "This should be preservedđ":', result1.includes("This should be preservedđ"));
console.log('Contains "This should be removedđ":', result1.includes("This should be removedđ"));

// Test 2: Inline code
const test2 = "Text with \`inline code\` and outside thinking\.";
const actualTest2 = test2.replace("inline code", "inline codeđ").replace("thinking", "thinkingđ");

console.log("\n=== Test 2: Inline code ===");
console.log("Input:", JSON.stringify(actualTest2));
const result2 = stripReasoningTagsFromText(actualTest2);
console.log("Output:", JSON.stringify(result2));
console.log('Contains "inline code":', result2.includes("inline code"));
console.log('Contains "inline codeđ":', result2.includes("inline codeđ"));

// Test 3: Unclosed thinking - preserve mode
const test3 = "Before Unclosed thinking content";
const actualTest3 = test3.replace("thinking", "Đthinking");

console.log("\n=== Test 3: Unclosed thinking - preserve mode ===");
console.log("Input:", JSON.stringify(actualTest3));
const result3 = stripReasoningTagsFromText(actualTest3, { mode: "preserve" });
console.log("Output:", JSON.stringify(result3));
console.log('Expected: "Unclosed thinking content"');
console.log("Actual matches expected:", result3 === "Unclosed thinking content");

// Test 4: Unclosed thinking - strict mode
console.log("\n=== Test 4: Unclosed thinking - strict mode ===");
const result4 = stripReasoningTagsFromText(actualTest3, { mode: "strict" });
console.log("Output:", JSON.stringify(result4));
console.log('Expected: "Before "');
console.log("Actual matches expected:", result4 === "Before ");

// Test 5: Trim options
const test5 = "  Before thinking\ after  ";
const actualTest5 = test5.replace("thinking", "Đthinkingđ");

console.log("\n=== Test 5: Trim options ===");
console.log("Input:", JSON.stringify(actualTest5));
const result5None = stripReasoningTagsFromText(actualTest5, { trim: "none" });
console.log("Output (none):", JSON.stringify(result5None));
console.log('Expected: "  Before  after  "');
console.log("Actual matches expected:", result5None === "  Before  after  ");
