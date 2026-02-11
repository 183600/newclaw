// Test the regex for test1
const test1 = "Before This is thinking</t> after.";
const thisIsThinkingRe =
  /\bThis is (thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Test 1:", test1);
console.log("Matches:", test1.match(thisIsThinkingRe));

// Let's check what each match includes
const matches = [...test1.matchAll(thisIsThinkingRe)];
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  console.log(`Match ${i + 1}:`, match[0]);
  console.log(`  Index:`, match.index);
  console.log(
    `  Full text after replacement:`,
    test1.substring(0, match.index) + test1.substring(match.index + match[0].length),
  );
}
