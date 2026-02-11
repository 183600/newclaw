// Test with correct tags using fromCharCode
const preservedText = "This should be preserved";
const removedText = "This should be removed";

// Construct the closing tag from hex: 3c 2f 74 68 69 6e 6b 3e
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // </think>

console.log("Closing tag:", JSON.stringify(closingTag));

const actualPreserved = preservedText + closingTag;
const actualRemoved = removedText + closingTag;

console.log("Preserved text:", JSON.stringify(actualPreserved));
console.log("Removed text:", JSON.stringify(actualRemoved));

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
const preservedMatch = actualPreserved.match(unpairedWordTagRe);
const removedMatch = actualRemoved.match(unpairedWordTagRe);

console.log("Preserved matches pattern:", preservedMatch);
console.log("Removed matches pattern:", removedMatch);

// The regex doesn't match because it expects "thinking", "thought", or "antthinking"
// But our text doesn't contain these words

// Let's check what we actually need to match
console.log(
  "\nThe problem: our regex expects the text to contain 'thinking', 'thought', or 'antthinking'",
);
console.log("But the actual text is just 'This should be preserved</think>' without 'thinking'");

// We need a different approach for cases like this
