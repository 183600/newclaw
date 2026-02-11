// Test with the correct string structure from hex analysis
const thinkingTag = String.fromCharCode(116, 104, 105, 110, 107); // "think"
const closingTag = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "

// Based on hex analysis, the structure should be:
const testText = `Start
first thought
Middle
second thought
End`;

console.log("Test text:", JSON.stringify(testText));
console.log("Length:", testText.length);

// Test QUICK_TAG_RE
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("QUICK_TAG_RE test:", QUICK_TAG_RE.test(testText));

// Test our regexes
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting unpairedWordTagRe:");
for (const match of testText.matchAll(unpairedWordTagRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}

// The issue is that "first thought" and "second thought" don't match unpairedWordTagRe
// because they don't have the expected prefix or closing tag

// Let's create a more comprehensive regex that handles this case
const comprehensiveRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:\s*<\/(?:t|think|thinking|thought|antthinking)>|\s*<[^>]*>)|(?:\b(\w+)\s+(thinking|thought|antthinking)(?:\s*<\/(?:t|think|thinking|thought|antthinking)>|\s*<[^>]*>))/gi;

console.log("\nTesting comprehensiveRe:");
for (const match of testText.matchAll(comprehensiveRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
  console.log("  Groups:", match.slice(1));
}

// Simulate processing with comprehensive regex
console.log("\nSimulating with comprehensive approach:");
const thinkingRanges = [];

for (const match of testText.matchAll(comprehensiveRe)) {
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
