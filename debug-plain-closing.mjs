// Test the plainClosingTagRe regex
const testText = "Before This is thinking after.";
console.log("Test text:", JSON.stringify(testText));

// The plainClosingTagRe regex from reasoning-tags.ts
const plainClosingTagRe = /(?<!^)\b\w+(?:\s+\w+)*\s*<\/(t|think|thinking|thought|antthinking)>/gi;

console.log("Testing plainClosingTagRe:");
const matches = [...testText.matchAll(plainClosingTagRe)];
console.log("Matches:", matches);

if (matches.length > 0) {
  matches.forEach((match, index) => {
    console.log(`Match ${index}:`);
    console.log(`  Full match: "${match[0]}" (length: ${match[0].length})`);
    console.log(`  Group 1: "${match[1] || "undefined"}"`);
    console.log(`  Index: ${match.index}`);
    console.log(`  End index: ${match.index + match[0].length}`);

    // Show what would be removed vs what would remain
    const before = testText.substring(0, match.index);
    const after = testText.substring(match.index + match[0].length);
    console.log(`  Before match: "${before}"`);
    console.log(`  After match: "${after}"`);
    console.log(`  Result if removed: "${before + after}"`);
  });
} else {
  console.log("No matches found.");
}
