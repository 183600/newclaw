const { stripReasoningTagsFromText } = require('./src/shared/text/reasoning-tags.ts');

// Test case from the file
const text = 'Text with `inline code\n';

console.log('Input:', JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log('Output:', JSON.stringify(result));
console.log('Expected: contains inline code
console.log('Contains inline code
console.log('Contains thinking
console.log('Test passed:', result.includes('inline code