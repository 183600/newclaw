// More detailed debug script

const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

function testDetailed(text) {
  console.log(`Testing: "${text}"`);
  const matches = [...text.matchAll(unpairedWordTagRe)];
  console.log(
    `Matches:`,
    matches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })),
  );

  // Simulate what the function does
  let result = text;
  const ranges = [];
  for (const match of matches) {
    const idx = match.index ?? 0;
    ranges.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  // Remove ranges in reverse order
  for (let i = ranges.length - 1; i >= 0; i--) {
    const range = ranges[i];
    result = result.slice(0, range.start) + result.slice(range.end);
  }

  console.log(`Result: "${result}"`);
  console.log("---");
}

// Test the failing cases
testDetailed("Before This is thinking after.");
testDetailed("Start First thought middle Second thought end.");
testDetailed("Before Unclosed thinking content");

// Test what should happen
console.log("--- Expected behaviors ---");
console.log('Input: "Before This is thinking after."');
console.log('Expected: "Before  after."');
console.log('The "This is thinking" part should be removed, but " after." should remain');
