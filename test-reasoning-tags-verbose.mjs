import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

console.log('Testing stripReasoningTagsFromText with actual test cases...\n');

// Test 1: Simple thinking tags
const test1 = "Before This is thinkingđ after.";
const result1 = stripReasoningTagsFromText(test1);
console.log('Test 1 - Simple thinking tags:');
console.log('Input: ', JSON.stringify(test1));
console.log('Output:', JSON.stringify(result1));
console.log('Expected: "Before  after."');
console.log('Match:', result1 === "Before  after.");
console.log('');

// Test 2: Multiple thinking blocks
const test2 = "Start First thoughtđ middle Second thoughtđ end.";
const result2 = stripReasoningTagsFromText(test2);
console.log('Test 2 - Multiple thinking blocks:');
console.log('Input: ', JSON.stringify(test2));
console.log('Output:', JSON.stringify(result2));
console.log('Expected: "Start  middle  end."');
console.log('Match:', result2 === "Start  middle  end.");
console.log('');

// Test 3: Preserve content within code blocks
const test3 = `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`;

const result3 = stripReasoningTagsFromText(test3);
console.log('Test 3 - Preserve content within code blocks:');
console.log('Input: ', JSON.stringify(test3));
console.log('Output:', JSON.stringify(result3));
console.log('Contains "This should be preservedđ":', result3.includes("This should be preservedđ"));
console.log('Contains "This should be removedđ":', result3.includes("This should be removedđ"));
console.log('');

// Test 4: Inline code preservation
const test4 = "Text with \`inline codeđ\` and outside thinkingđ.";
const result4 = stripReasoningTagsFromText(test4);
console.log('Test 4 - Inline code preservation:');
console.log('Input: ', JSON.stringify(test4));
console.log('Output:', JSON.stringify(result4));
console.log('Contains "inline codeđ":', result4.includes("inline codeđ"));
console.log('Contains "thinkingđ":', result4.includes("thinkingđ"));
console.log('');

// Test 5: Preserve unclosed thinking tags in preserve mode
const test5 = "Before ĐUnclosed thinking content";
const result5 = stripReasoningTagsFromText(test5, { mode: "preserve" });
console.log('Test 5 - Preserve unclosed thinking tags in preserve mode:');
console.log('Input: ', JSON.stringify(test5));
console.log('Output:', JSON.stringify(result5));
console.log('Expected: "Unclosed thinking content"');
console.log('Match:', result5 === "Unclosed thinking content");
console.log('');

// Test 6: Remove unclosed thinking tags in strict mode
const test6 = "Before ĐUnclosed thinking content";
const result6 = stripReasoningTagsFromText(test6, { mode: "strict" });
console.log('Test 6 - Remove unclosed thinking tags in strict mode:');
console.log('Input: ', JSON.stringify(test6));
console.log('Output:', JSON.stringify(result6));
console.log('Expected: "Before ");
console.log('Match:', result6 === "Before ");
console.log('');

// Test 7: Trim options
const test7 = "  Before thinkingđ after  ";
const resultNone = stripReasoningTagsFromText(test7, { trim: "none" });
const resultStart = stripReasoningTagsFromText(test7, { trim: "start" });
const resultBoth = stripReasoningTagsFromText(test7, { trim: "both" });
console.log('Test 7 - Trim options:');
console.log('Input: ', JSON.stringify(test7));
console.log('Result (none):', JSON.stringify(resultNone));
console.log('Expected (none): "  Before  after  ");
console.log('Match (none):', resultNone === "  Before  after  ");
console.log('Result (start):', JSON.stringify(resultStart));
console.log('Expected (start): "Before  after  ");
console.log('Match (start):', resultStart === "Before  after  ");
console.log('Result (both):', JSON.stringify(resultBoth));
console.log('Expected (both): "Before  after.");
console.log('Match (both):', resultBoth === "Before  after.");
console.log('');