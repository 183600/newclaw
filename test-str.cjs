const testStr = 'inline code
console.log('Input:', JSON.stringify(testStr));
console.log('Length:', testStr.length);
console.log('Char codes:', Array.from(testStr).map(c => c.charCodeAt(0)));

const processed = testStr.replace(/<\/arg_value>/g, '');
console.log('After removing
console.log('Processed:', JSON.stringify(processed));

// Check if the replacement is working
const hasArgValue = testStr.includes('
console.log('Has arg_value:', hasArgValue);

// Check what the test expects
const expected = 'inline code
console.log('Expected:', JSON.stringify(expected));
console.log('Match:', processed === expected);