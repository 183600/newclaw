// Debug with the actual test case content

const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think|thinking|thought|antthinking)\b[^<>]*>/gi;
const unpairedWordTagRe =
  /(?:\bThis is |\b(\w+) )?(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

function testWithActualContent(text) {
  console.log(`Testing: "${text}"`);

  // Test HTML thinking tags
  const htmlMatches = [...text.matchAll(THINKING_TAG_RE)];
  console.log(
    `HTML matches:`,
    htmlMatches.map((m) => ({ match: m[0], index: m.index, isClose: m[1] === "/" })),
  );

  // Test unpaired word tags
  const unpairedMatches = [...text.matchAll(unpairedWordTagRe)];
  console.log(
    `Unpaired matches:`,
    unpairedMatches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })),
  );

  console.log("---");
}

// Test with actual content from test cases
testWithActualContent("Before This is thinking</think> after.");
testWithActualContent("Start First thought</think> middle Second thought</think> end.");
testWithActualContent("Text with `inline code</think>` and outside thinking</think>.");
testWithActualContent("Before Unclosed thinking content");
