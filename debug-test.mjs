import { stripReasoningTagsFromText } from './src/shared/text/reasoning-tags.js';

console.log('=== Test 1: inline code preservation ===');
const test1 = "Text with `inline code` and outside thinking
const result1 = stripReasoningTagsFromText(test1);
console.log('Input:', JSON.stringify(test1));
console.log('Output:', JSON.stringify(result1));
console.log('Expected: contains "inline code
console.log('Actual contains "inline code
console.log('Expected: NOT contains "thinking
console.log('Actual NOT contains "thinking
console.log('');

console.log('=== Test 2: trim options ===');
const test2 = "  Before thinking
const resultNone = stripReasoningTagsFromText(test2, { trim: "none" });
console.log('Input:', JSON.stringify(test2));
console.log('Result (none):', JSON.stringify(resultNone));
console.log('Expected (none): "  Before  after  "');

const resultStart = stripReasoningTagsFromText(test2, { trim: "start" });
console.log('Result (start):', JSON.stringify(resultStart));
console.log('Expected (start): "Before  after  "');

const resultBoth = stripReasoningTagsFromText(test2, { trim: "both" });
console.log('Result (both):', JSON.stringify(resultBoth));
console.log('Expected (both): "Before  after."');