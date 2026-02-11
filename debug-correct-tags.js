// Test with correct tags from hex output
const preservedText = "This should be preserved";
const removedText = "This should be removed";

// Add the correct closing tags from hex output: 
const actualPreserved = preservedText + "
";
const actualRemoved = removedText + "
";

console.log("Preserved text:", JSON.stringify(actualPreserved));
console.log("Removed text:", JSON.stringify(actualRemoved));

const unpairedWordTagRe = /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
const preservedMatch = actualPreserved.match(unpairedWordTagRe);
const removedMatch = actualRemoved.match(unpairedWordTagRe);

console.log("Preserved matches pattern:", preservedMatch);
console.log("Removed matches pattern:", removedMatch);

// Test the full regex with global flag
console.log("\nTesting with global flag:");
const testString = `Code content ${actualPreserved} outside ${actualRemoved} end.`;
console.log("Test string:", JSON.stringify(testString));

console.log("All matches:");
for (const match of testString.matchAll(unpairedWordTagRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}