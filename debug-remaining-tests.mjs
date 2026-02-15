import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Test case: nested HTML entities
const testCase1 = "&#x110;thinking &#x110;nested thinking&#x111; thinking&#x111;";
console.log("Test case: nested HTML entities");
console.log("Input:", JSON.stringify(testCase1));
const result1 = stripReasoningTagsFromText(testCase1);
console.log("Output:", JSON.stringify(result1));
console.log("Expected:", JSON.stringify(""));
console.log("Match:", result1 === "");
console.log("");

// Test case: malformed HTML entities
const testCase2 = "&#x110;thinking content&#x111; and &#x110;thinking";
console.log("Test case: malformed HTML entities");
console.log("Input:", JSON.stringify(testCase2));
const result2 = stripReasoningTagsFromText(testCase2);
console.log("Output:", JSON.stringify(result2));
console.log("Expected:", JSON.stringify(" and "));
console.log("Match:", result2 === " and ");
console.log("");

// Test case: preserve reasoning tags within fenced code blocks
const testCase3 = `
Before
\`\`\`
This should be preserved thinking
Even Đthisđ should be preserved
\`\`\`
After thinking`;
console.log("Test case: preserve reasoning tags within fenced code blocks");
console.log("Input:", JSON.stringify(testCase3));
const result3 = stripReasoningTagsFromText(testCase3);
console.log("Output:", JSON.stringify(result3));
console.log(
  "Contains 'This should be preserved thinking':",
  result3.includes("This should be preserved thinking"),
);
console.log(
  "Contains 'Even Đthisđ should be preserved':",
  result3.includes("Even Đthisđ should be preserved"),
);
console.log("Contains 'After thinking':", result3.includes("After thinking"));
console.log("");

// Test case: preserve reasoning tags within inline code
const testCase4 = "Before \`code with thinking\` after thinking";
console.log("Test case: preserve reasoning tags within inline code");
console.log("Input:", JSON.stringify(testCase4));
const result4 = stripReasoningTagsFromText(testCase4);
console.log("Output:", JSON.stringify(result4));
console.log("Contains 'code with thinking':", result4.includes("code with thinking"));
console.log("Contains 'after thinking':", result4.includes("after thinking"));
console.log("");

// Test case: multiple code blocks with reasoning tags
const testCase5 = `
\`\`\`javascript
// thinking in code
function test() { return Đthinkingđ; }
\`\`\`
Middle thinking
\`\`\`python
# more thinking in code
def func(): pass
\`\`\`
End thinking`;
console.log("Test case: multiple code blocks with reasoning tags");
console.log("Input:", JSON.stringify(testCase5));
const result5 = stripReasoningTagsFromText(testCase5);
console.log("Output:", JSON.stringify(result5));
console.log("Contains '// thinking in code':", result5.includes("// thinking in code"));
console.log(
  "Contains 'function test() { return Đthinkingđ; }':",
  result5.includes("function test() { return Đthinkingđ; }"),
);
console.log("Contains '# more thinking in code':", result5.includes("# more thinking in code"));
console.log("Contains 'Middle thinking':", result5.includes("Middle thinking"));
console.log("Contains 'End thinking':", result5.includes("End thinking"));
console.log("");

// Test case: tilde-fenced code blocks
const testCase6 = `
~~~
thinking in tilde block
~~~
After thinking`;
console.log("Test case: tilde-fenced code blocks");
console.log("Input:", JSON.stringify(testCase6));
const result6 = stripReasoningTagsFromText(testCase6);
console.log("Output:", JSON.stringify(result6));
console.log("Contains 'thinking in tilde block':", result6.includes("thinking in tilde block"));
console.log("Contains 'After thinking':", result6.includes("After thinking"));
console.log("");

// Test case: deeply nested patterns
const testCase7 = "&#x110;thinking Đthinking nested thinking&#x111; thinking&#x111;";
console.log("Test case: deeply nested patterns");
console.log("Input:", JSON.stringify(testCase7));
const result7 = stripReasoningTagsFromText(testCase7);
console.log("Output:", JSON.stringify(result7));
console.log("Expected:", JSON.stringify(""));
console.log("Match:", result7 === "");
console.log("");

// Test case: mixed content with multiple patterns
const testCase8 = `
Start of message
This is thinking that should be removed.

\`\`\`code block
This thinking should be preserved
function test() { return Đthinkingđ; }
\`\`\`

Middle content with <thinking>HTML tags</thinking> to remove.

End with First thought and Second antthinking.
`;
console.log("Test case: mixed content with multiple patterns");
console.log("Input:", JSON.stringify(testCase8));
const result8 = stripReasoningTagsFromText(testCase8);
console.log("Output:", JSON.stringify(result8));
console.log("Contains 'Start of message':", result8.includes("Start of message"));
console.log(
  "Contains 'This thinking should be preserved':",
  result8.includes("This thinking should be preserved"),
);
console.log(
  "Contains 'function test() { return Đthinkingđ; }':",
  result8.includes("function test() { return Đthinkingđ; }"),
);
console.log(
  "Contains 'Middle content with  to remove.':",
  result8.includes("Middle content with  to remove."),
);
console.log("Contains 'End with  and .':", result8.includes("End with  and ."));
console.log("");

// Test case: complex nested patterns with code blocks
const testCase9 = `
Before
\`\`\`
<thinking>HTML in code</thinking>
Đthinking special in codeđ
\`\`\`
After <thinking>HTML outside</thinking> end.
`;
console.log("Test case: complex nested patterns with code blocks");
console.log("Input:", JSON.stringify(testCase9));
const result9 = stripReasoningTagsFromText(testCase9);
console.log("Output:", JSON.stringify(result9));
console.log(
  "Contains '<thinking>HTML in code</thinking>':",
  result9.includes("<thinking>HTML in code</thinking>"),
);
console.log(
  "Contains 'Đthinking special in codeđ':",
  result9.includes("Đthinking special in codeđ"),
);
console.log("Contains 'Before':", result9.includes("Before"));
console.log("Contains 'After  end.':", result9.includes("After  end."));
console.log("");
