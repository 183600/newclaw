// Complete debug script for the entire reasoning tags process

// Simulate the WORD_CLOSE_RE regex
const WORD_CLOSE_RE =
  /\b(?:This is|This should be|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)\u0111/gi;

const text = "__CODE_BLOCK_0__Outside This should be removedđ code block.";

console.log("Text after placeholder replacement:");
console.log(JSON.stringify(text));

console.log("\nTesting WORD_CLOSE_RE against the text:");
const matches = [...text.matchAll(WORD_CLOSE_RE)];
matches.forEach((match, index) => {
  console.log(`Match ${index}:`, JSON.stringify(match[0]));
  console.log(`Start: ${match.index}, End: ${match.index + match[0].length}`);
});

// Test if the specific text matches
const specificText = "This should be removedđ";
console.log("\nTesting specific text:", JSON.stringify(specificText));
const specificMatch = specificText.match(WORD_CLOSE_RE);
console.log("Matches:", specificMatch);

// Test with word boundaries
console.log("\nTesting with word boundaries:");
const withWordBoundaries = /\bThis should be removedđ\b/gi;
const wbMatch = text.match(withWordBoundaries);
console.log("Word boundary match:", wbMatch);

// Test a more flexible pattern
console.log("\nTesting more flexible pattern:");
const flexiblePattern = /\bThis should be\s+(thinking|thought|antthinking)\u0111/gi;
const flexMatch = text.match(flexiblePattern);
console.log("Flexible match:", flexMatch);

// Test even more flexible
console.log("\nTesting even more flexible pattern:");
const veryFlexiblePattern = /\b\w+(?:\s+\w+)*\s+(thinking|thought|antthinking)\u0111/gi;
const veryFlexMatch = text.match(veryFlexiblePattern);
console.log("Very flexible match:", veryFlexMatch);
