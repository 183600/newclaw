// Test the regex for test1
const test1 = "Before This is thinking</t> after.";
const unpairedWordTagRe =
  /(?:\b\w+\s+)?\b\w+\s+(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Test 1:", test1);
console.log("Matches:", test1.match(unpairedWordTagRe));
console.log("");

// Let's check what words are before thinking
const match = test1.match(unpairedWordTagRe);
if (match) {
  const matchText = match[0];
  const thinkingIndex = matchText.indexOf("thinking");
  const beforeThinking = matchText.substring(0, thinkingIndex).trim();
  console.log("Match text:", matchText);
  console.log("Before thinking:", beforeThinking);
  console.log("Words before thinking:", beforeThinking.split(/\s+/));
}
