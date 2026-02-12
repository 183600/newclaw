// Test what unpairedWordTagRe actually matches
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>|\u0111)/gi;

const matches = [...testText.matchAll(unpairedWordTagRe)];
console.log("Matches:", matches);

if (matches.length > 0) {
  matches.forEach((match, index) => {
    console.log(`Match ${index}:`);
    console.log(`  Full match: "${match[0]}" (length: ${match[0].length})`);
    console.log(`  Group 1: "${match[1] || "undefined"}"`);
    console.log(`  Group 2: "${match[2] || "undefined"}"`);
    console.log(`  Index: ${match.index}`);
    console.log(`  End index: ${match.index + match[0].length}`);

    // Show what would be removed vs what would remain
    const before = testText.substring(0, match.index);
    const after = testText.substring(match.index + match[0].length);
    console.log(`  Before match: "${before}"`);
    console.log(`  After match: "${after}"`);
    console.log(`  Result if removed: "${before + after}"`);
  });
}
