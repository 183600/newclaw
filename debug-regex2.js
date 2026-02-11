// Test the regex
const unpairedWordTagRe =
  /\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

const test1 = "Before This is thinking</t> after.";
console.log("Test 1:", test1);
console.log("Matches:", test1.match(unpairedWordTagRe));
console.log("");

const test2 = "Start First thought</t> middle Second thought</t> end.";
console.log("Test 2:", test2);
console.log("Matches:", test2.match(unpairedWordTagRe));
console.log("");
