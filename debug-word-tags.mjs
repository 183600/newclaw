// Debug word tag patterns
const WORD_HTML_CLOSE_RE =
  /\b(?:This is|First|Second|Third|One|Two|Three)\s+(thinking|thought|antthinking)(?:<\/t>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;

const text1 = "Before This is thinking</thinking> after.";
const text2 = "Start First thought</thought> middle Second thought</thought> end.";

console.log("=== Test 1 ===");
console.log("Text:", text1);
const matches1 = [...text1.matchAll(WORD_HTML_CLOSE_RE)];
console.log("Matches:", matches1);

console.log("\n=== Test 2 ===");
console.log("Text:", text2);
const matches2 = [...text2.matchAll(WORD_HTML_CLOSE_RE)];
console.log("Matches:", matches2);

// Check if the pattern is working correctly
console.log("\n=== Pattern Analysis ===");
console.log("Pattern:", WORD_HTML_CLOSE_RE);
console.log(
  "Test 1: 'This is thinking</thinking>' matches:",
  WORD_HTML_CLOSE_RE.test("This is thinking</thinking>"),
);
WORD_HTML_CLOSE_RE.lastIndex = 0; // Reset after test
console.log(
  "Test 2: 'First thought</thought>' matches:",
  WORD_HTML_CLOSE_RE.test("First thought</thought>"),
);
