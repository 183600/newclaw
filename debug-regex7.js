// Test the regex for test1
const test1 = "Before This is thinking</t> after.";
const unpairedWordTagRe =
  /(?<!^)(?:\b\w+\s+)?\b\w+\s+(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Test 1:", test1);
console.log("Matches:", test1.match(unpairedWordTagRe));

// Let's check what each match includes
const matches = [...test1.matchAll(unpairedWordTagRe)];
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i + 1}:`, match[0]);
  console.log(`  Index:`, match.index);
  console.log(`  Before:`, test1.substring(Math.max(0, match.index - 5), match.index));
  console.log(
    `  After:`,
    test1.substring(
      match.index + match[0].length,
      Math.min(test1.length, match.index + match[0].length + 5),
    ),
  );

  // Check the words before thinking
  const matchText = match[0];
  const thinkingWord = match[1];
  const thinkingIndex = matchText.indexOf(thinkingWord);
  const beforeThinking = matchText.substring(0, thinkingIndex).trim();
  const words = beforeThinking.split(/\s+/);
  console.log(`  Words before thinking:`, words);
}
