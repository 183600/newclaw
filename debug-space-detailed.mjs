// Test the space handling logic with detailed output
const cleaned = "Before This is thinkingđ after.";
const range = { start: 7, end: 24 };

console.log("Original:", JSON.stringify(cleaned));
console.log("Original length:", cleaned.length);

const beforePart = cleaned.slice(0, range.start);
const afterPart = cleaned.slice(range.end);

console.log("Before part:", JSON.stringify(beforePart));
console.log("After part:", JSON.stringify(afterPart));

const beforeChar = cleaned[range.start - 1];
const afterChar = cleaned[range.end];

console.log("Before char:", JSON.stringify(beforeChar));
console.log("After char:", JSON.stringify(afterChar));

let replacement = " ";

const result = beforePart + replacement + afterPart;
console.log("Result:", JSON.stringify(result));
console.log("Result length:", result.length);

// Count spaces in result
const spaceCount = (result.match(/ /g) || []).length;
console.log("Space count:", spaceCount);

// Check each character
for (let i = 0; i < result.length; i++) {
  console.log(`Char at ${i}: ${JSON.stringify(result[i])}`);
}
