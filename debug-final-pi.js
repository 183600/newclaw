// Construct the exact string from hex analysis
// Line 0: "Start" + "think" + "
// Line 1: "first thought" + ""
// Line 2: "Middle" + "think" + ""
// Line 3: "second thought" + ""
// Line 4: "End"

const thinkingWord = "think";
const thinkingClosing = String.fromCharCode(60, 47, 116, 104, 105, 110, 107, 62); // "

const testText = `Start${thinkingWord}${thinkingClosingTag}first thought
Middle${thinkingWord}${thinkingClosingTag}second thought
End`;

console.log("Test text:", JSON.stringify(testText));
console.log("Length:", testText.length);

// Check character by character around the tags
console.log("\nCharacter analysis:");
for (let i = 0; i < testText.length; i++) {
  const char = testText[i];
  const code = char.charCodeAt(0);
  if (code === 60 || code === 47 || code === 62) {
    // <, /, >
    console.log(`  [${i}]: "${char}" (${code}) - TAG CHARACTER`);
  }
}

// Test QUICK_TAG_RE
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

console.log("\nQUICK_TAG_RE test:", QUICK_TAG_RE.test(testText));

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
// because they don't have the expected closing tag immediately after

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
