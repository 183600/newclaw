// Test the modified regex
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

// Original regex
const originalRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

// Modified regex
const modifiedRe =
  /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

console.log("Original regex matches:");
const originalMatches = [...testText.matchAll(originalRe)];
originalMatches.forEach((match, index) => {
  console.log(`  Match ${index}: "${match[0]}" at ${match.index} (length: ${match[0].length})`);
});

console.log("\nModified regex matches:");
const modifiedMatches = [...testText.matchAll(modifiedRe)];
modifiedMatches.forEach((match, index) => {
  console.log(`  Match ${index}: "${match[0]}" at ${match.index} (length: ${match[0].length})`);

  // Show what would be removed vs what would remain
  const before = testText.substring(0, match.index);
  const after = testText.substring(match.index + match[0].length);
  console.log(`    Before: "${before}"`);
  console.log(`    After: "${after}"`);
  console.log(`    Result: "${before + after}"`);
});
