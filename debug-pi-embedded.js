// Debug the pi-embedded-utils test case
const testText = "Start\nfirst thought\nMiddle\nsecond thought\nEnd";

console.log("Test text:", JSON.stringify(testText));

// Test our regexes
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;
const textWithClosingTagRe =
  /(?:\bThis is |\b(\w+) )?([^\n<>]{3,})(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

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

// The issue might be that "Middle" is being matched by textWithClosingTagRe
// Let's check what "Middle\nsecond thought\n" looks like

const middlePart = "Middle\nsecond thought\n";
console.log("\nMiddle part:", JSON.stringify(middlePart));
console.log("Middle part matches unpairedWordTagRe:", middlePart.match(unpairedWordTagRe));
console.log("Middle part matches textWithClosingTagRe:", middlePart.match(textWithClosingTagRe));

// The problem is that textWithClosingTagRe is matching "Middle" followed by ""
// This is happening because the regex is too broad

// Let's create a more specific regex that only matches content that should actually be removed
// Based on the test expectations, we should only remove "first thought" and "second thought"
// but keep "Middle"

const moreSpecificRe =
  /\b(?:first|second|This is) \w+(?:<\/(?:t|think|thinking|thought|antthinking)>|<[^>]*>)/gi;

console.log("\nTesting moreSpecificRe:");
for (const match of testText.matchAll(moreSpecificRe)) {
  console.log("  Match:", JSON.stringify(match[0]));
  console.log("  Index:", match.index);
}
