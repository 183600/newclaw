// Test with the correct string from hex dump
const thinkingTag = String.fromCharCode(116, 104, 105, 110, 107); // "think"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "</think>"

const testText = `Start${thinkingTag}${closingTag}first thought
Middle${thinkingTag}${closingTag}second thought
End`;

console.log("Test text:", JSON.stringify(testText));

// Test our regexes
const unpairedWordTagRe = /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
const textWithClosingTagRe = /(?:\bThis is |\b(\w+) )?([^\n<>]{3,})(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
for (const match of testText.matchAll(unpairedWordTagRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}

console.log("\nTesting textWithClosingTagRe:");
for (const match of testText.matchAll(textWithClosingTagRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}

// The issue is clear now:
// "first thought
</think>" matches unpairedWordTagRe (because it contains "thought")
// "Middle
</think>" doesn't match either regex (because it doesn't contain "thinking", "thought", or "antthinking")
// "second thought
</think>" matches unpairedWordTagRe (because it contains "thought")

// So "Middle
</think>" should be preserved, but it's being deleted. This suggests there's another issue.

// Let's check if there are other regexes or logic that might be deleting "Middle
</think>"

// The problem might be that my textWithClosingTagRe is too broad and matching "Middle
</think>"
// even though it doesn't contain the specific keywords.

// Let's create a more conservative approach
const conservativeRe = /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nSimulating with conservative approach only:");
const thinkingRanges = [];

for (const match of testText.matchAll(conservativeRe)) {
  const idx = match.index ?? 0;
  console.log("  Adding range:", [idx, idx + match[0].length], "for:", JSON.stringify(match[0]));
  thinkingRanges.push({
    start: idx,
    end: idx + match[0].length,
  });
}

console.log("Thinking ranges:", thinkingRanges);

// Remove ranges in reverse order
let result = testText;
for (let i = thinkingRanges.length - 1; i >= 0; i--) {
  const range = thinkingRanges[i];
  result = result.slice(0, range.start) + result.slice(range.end);
}

console.log("Result:", JSON.stringify(result));
console.log("Expected: StartMiddleEnd");
console.log("Match:", result === "StartMiddleEnd");