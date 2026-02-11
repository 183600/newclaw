// Test the regex for test2
const test2 = "Start First thought</t> middle Second thought</t> end.";
const unpairedWordTagRe =
  /(?<!^)(?:\b\w+\s+)?\b\w+\s+(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Test 2:", test2);
console.log("Matches:", test2.match(unpairedWordTagRe));

// Let's check what each match includes
const matches = [...test2.matchAll(unpairedWordTagRe)];
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i + 1}:`, match[0]);
  console.log(`  Index:`, match.index);
  console.log(`  Before:`, test2.substring(Math.max(0, match.index - 5), match.index));
  console.log(
    `  After:`,
    test2.substring(
      match.index + match[0].length,
      Math.min(test2.length, match.index + match[0].length + 5),
    ),
  );
}
