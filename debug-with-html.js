// Test with the actual HTML tags from the test file

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

// Create the actual strings with HTML tags
const test1 = "Before This is thinking after.";
const test2 = "Start First thought middle Second thought end.";

console.log("Test 1:", test1);
console.log("Matches:", [...test1.matchAll(unpairedWordTagRe)]);

console.log("\nTest 2:", test2);
console.log("Matches:", [...test2.matchAll(unpairedWordTagRe)]);

// Test what happens when we manually remove the matches
function simulateRemoval(text) {
  const ranges = [];
  for (const match of text.matchAll(unpairedWordTagRe)) {
    const idx = match.index ?? 0;
    ranges.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  let result = text;
  for (let i = ranges.length - 1; i >= 0; i--) {
    const range = ranges[i];
    result = result.slice(0, range.start) + result.slice(range.end);
  }

  return result;
}

console.log("\nRemoval simulation:");
console.log("Test 1 result:", simulateRemoval(test1));
console.log("Test 2 result:", simulateRemoval(test2));
