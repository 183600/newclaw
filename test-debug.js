const fs = require('fs');
const { stripReasoningTagsFromText } = require('./src/shared/text/reasoning-tags.ts');

// Read the test file to get the exact string
const testContent = fs.readFileSync('src/shared/text/reasoning-tags.test.ts', 'utf8');
const lines = testContent.split('\n');
const testLine = lines.find(line => line.includes('const text = "Text with'));
const text = testLine.match(/const text = "(.*)";/)[1];

console.log('Input:', JSON.stringify(text));
console.log('Length:', text.length);
console.log('Char codes:', Array.from(text).map((c, i) => ({ i, char: c, code: c.charCodeAt(0) })));

const result = stripReasoningTagsFromText(text);
console.log('Output:', JSON.stringify(result));
console.log('Expected: contains inline code
console.log('Contains inline code
console.log('Contains thinking
console.log('Test passed:', result.includes('inline code