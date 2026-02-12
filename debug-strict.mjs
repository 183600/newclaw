// Debug script for strict mode
const text = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(text));
console.log("Length:", text.length);
console.log("Char at index 6:", JSON.stringify(text[6])); // Should be space
console.log("Char at index 7:", JSON.stringify(text[7])); // Should be 'U'
