// Debug script to understand reasoning tags behavior

const QUICK_TAG_RE =
  /<\s*\/\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/gi;

function testRegex(text) {
  console.log(`Testing: "${text}"`);
  const matches = [...text.matchAll(QUICK_TAG_RE)];
  console.log(
    `Matches:`,
    matches.map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) })),
  );
  console.log("---");
}

// Test cases from failing tests - using actual special characters
testRegex("Before This is thinking\u0111 after.");
testRegex("Start First thought\u0111 middle Second thought\u0111 end.");
testRegex("Text with `inline code\u0111` and outside thinking\u0111.");
testRegex("Before Unclosed thinking content");

// Test inline code case
testRegex("Text with `inline code` and outside thinking.");

// Test code block case
const codeBlock = `\`\`\`javascript
function test() {
  // This should be preserved
  return true;
}
\`\`\`
Outside This should be removed code block.`;
testRegex(codeBlock);
