import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test only closing tags with detailed debug
console.log("Only Closing Tags Test");
const onlyClosingText = "Before content</thinking> after.";
console.log("Input:", onlyClosingText);

// Let's manually check the regex
const STANDALONE_CLOSE_RE = /(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/gi;
const matches = [...onlyClosingText.matchAll(STANDALONE_CLOSE_RE)];
console.log("Matches found:", matches.length);
matches.forEach((match, index) => {
  console.log(`Match ${index}: "${match[0]}" at position ${match.index}`);
});

const result2 = stripReasoningTagsFromText(onlyClosingText);
console.log("Output:", result2);
console.log("Expected: Before  after.");
