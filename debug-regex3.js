// Test the regex for test2
const test2 = "Start First thought</t> middle Second thought</t> end.";
const unpairedWordTagRe =
  /(?:\b\w+\s+)?\b\w+\s+(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

console.log("Test 2:", test2);
console.log("Matches:", test2.match(unpairedWordTagRe));
console.log("");

// Let's try a different approach - match each pattern separately
const pattern1 = /\bFirst thought<\/t>/gi;
const pattern2 = /\bSecond thought<\/t>/gi;

console.log("Pattern 1 matches:", test2.match(pattern1));
console.log("Pattern 2 matches:", test2.match(pattern2));
