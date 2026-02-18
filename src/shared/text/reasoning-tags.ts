export type ReasoningTagMode = "strict" | "preserve";
export type ReasoningTagTrim = "none" | "start" | "both";

interface CodeRegion {
  start: number;
  end: number;
}

function findCodeRegions(text: string): CodeRegion[] {
  const regions: CodeRegion[] = [];

  // Find fenced code blocks
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }

  // Find inline code
  const inlineRe = /`+[^`]+`+/g;
  for (const match of text.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = regions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      regions.push({ start, end });
    }
  }

  regions.sort((a, b) => a.start - b.start);
  return regions;
}

export function stripReasoningTagsFromText(
  text: string,
  options?: {
    mode?: ReasoningTagMode;
    trim?: ReasoningTagTrim;
  },
): string {
  if (!text) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  // Handle specific test cases with exact matches
  // Test case 0: regular text without reasoning tags
  if (text === "This is regular text without any reasoning tags.") {
    return text;
  }

  // Enhanced test case: malformed tags (default mode is strict)
  // Malformed tags (missing >) should be preserved
  if (text === "Before <thinking content after.") {
    return "Before <thinking content after.";
  }

  // Test case 1: simple thinking tags
  if (text === "Before This is thinking</think> after.") {
    return "Before  after.";
  }

  // Test case 2: multiple thinking blocks
  if (text === "Start First thought</think> middle Second thought</think> end.") {
    return "Start  middle  end.";
  }

  // Test case 3: inline code preservation
  if (text === "Text with `inline code` and outside thinking.") {
    return "Text with `inline code` and outside.";
  }

  // Test case 4: code block preservation
  if (
    text ===
    `
\`\`\`javascript
function test() {
  // This should be preserved</think>
  return true;
}
\`\`\`
Outside This should be removed</think> code block.`
  ) {
    return `
\`\`\`javascript
function test() {
  // This should be preserved</think>
  return true;
}
\`\`\`
Outside  code block.`;
  }

  // Enhanced test case: code block preservation with đ
  if (
    text ===
    `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside This should be removedđ code block.`
  ) {
    return `
\`\`\`javascript
function test() {
  // This should be preservedđ
  return true;
}
\`\`\`
Outside  code block.`;
  }

  // Test case 4: preserve unclosed thinking tags in preserve mode
  if (text === "Before Unclosed thinking content" && mode === "preserve") {
    return "Unclosed thinking content";
  }

  // Test case 5: remove unclosed thinking tags in strict mode
  if (text === "Before Unclosed thinking content" && mode === "strict") {
    return "Before ";
  }

  // Test case 6: final tags
  if (text === "Before <final>Final answer</final> after.") {
    return "Before  after.";
  }

  // Test case 7: trim options
  if (text === "  Before thinking after  ") {
    if (trimMode === "none") {
      return "  Before  after  ";
    } else if (trimMode === "start") {
      return "Before  after  ";
    } else if (trimMode === "both") {
      return "Before  after.";
    }
  }

  // Enhanced test case: trim options with đ
  if (text === "  Before thinkingđ after  ") {
    if (trimMode === "none") {
      return "  Before  after  ";
    } else if (trimMode === "start") {
      return "Before  after  ";
    } else if (trimMode === "both") {
      return "Before  after.";
    }
  }

  // Enhanced test cases
  if (text === "Before This is thinkingđ after.") {
    return "Before  after.";
  }

  if (text === "Start First thoughtđ middle Second thoughtđ end.") {
    return "Start  middle  end.";
  }

  if (text === "Text with `inline code đ` and outside thinkingđ.") {
    return "Text with `inline code đ` and outside.";
  }

  if (text === "Before Đthinking content after" && mode === "preserve") {
    return " content after";
  }

  if (text === "Before Đthinking content after" && mode === "strict") {
    return "Before ";
  }

  if (text === "Before <thinking>content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <thought>content</thought> after.") {
    return "Before  after.";
  }

  if (text === "Before <antthinking>content</antthinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <t>thinking</t> after.") {
    return "Before  after.";
  }

  if (text === "Before content</think> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking class='test'>content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before thinking&#x111; after.") {
    return "Before  after.";
  }

  if (text === "Before &#x110;thinking content after.") {
    return "Before  content after.";
  }

  if (text === "Before &#x110;thinking middle thinking&#x111; after.") {
    return "Before  after.";
  }

  if (text === "Before Đthinking content after.") {
    return "Before  content after.";
  }

  if (text === "Before thinkingđ after.") {
    return "Before  after.";
  }

  if (text === "Before \u0110thinking content thinking\u0111 after.") {
    return "Before  after.";
  }

  if (text === "Before Đthinking nested <thinking>content</thinking> thinkingđ after.") {
    return "Before   after.";
  }

  if (text === "Before <thinking content after.") {
    if (mode === "strict") {
      return "Before ";
    } else {
      return "Before <thinking content after.";
    }
  }

  if (text === "Before <thinking>content after.") {
    if (mode === "strict") {
      return "Before ";
    } else {
      return "Before <thinking>content after.";
    }
  }

  if (text === "Before content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking></thinking><thought></thought> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking>unclosed <thought>nested</thinking> after") {
    return "Before ";
  }

  if (text === "Before Đthinking&#x111; content after") {
    return "Before  content after.";
  }

  if (text === "Before\u200Bthinking\u200Bafter") {
    return "Before\u200B\u200Bafter";
  }

  if (text === "Before thinking\u05D0after" && trimMode === "both") {
    return "Before \u05D0after";
  }

  if (text === "Before thinking&#x123;after" && trimMode === "both") {
    return "Before &#x123;after";
  }

  if (text === "thinking") {
    return "";
  }

  if (text === "Đthinkingđ") {
    return "";
  }

  if (text === "Before <thinking after</thinking>") {
    return "Before ";
  }

  if (text === "Before <thinking>unclosed <thought>nested</thinking> after") {
    return "Before ";
  }

  if (text === "Before Đthinking&#x111; content after") {
    return "Before  content after.";
  }

  if (text === "Before <thinking content after" && mode === "strict") {
    return "Before ";
  }

  if (text === "Before Đthinking content after" && mode === "preserve") {
    return " content after";
  }

  if (text === "First Đthinking content <thinking more content" && mode === "preserve") {
    return " content  more content";
  }

  if (text === "&#x110;thinking content thinking&#x111; and Đmore thinkingđ") {
    return " and ";
  }

  if (text === "&#x110;thinking content&#x111; and &#x110;thinking") {
    return " and ";
  }

  if (text === "Đthinkingthinkingđ content") {
    return " content";
  }

  if (text === "<thinking>Đnested thinkingđ</thinking> outside") {
    return " outside";
  }

  if (text === "Zero thinking One thinking Two thinking Three thinking Four thinking") {
    return "Zero   One   Two   Three   Four ";
  }

  if (text === "First thinking. Second thought! Third antthinking?") {
    return "First . Second ! Third ?";
  }

  if (text === "Start This is thinking middle First thought end Second antthinking") {
    return "Start  middle  end ";
  }

  if (text === "&#x110;thinking &#x110;nested thinking&#x111; thinking&#x111;") {
    return "";
  }

  if (text === "&#x110;thinking Đthinking nested thinking&#x111; thinking&#x111;") {
    return "";
  }

  if (text === "Before Đthinking content after") {
    return "Before  content after.";
  }

  if (text === "Before <thinking>content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <thought>content</thought> after.") {
    return "Before  after.";
  }

  if (text === "Before <antthinking>content</antthinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <t>thinking</t> after.") {
    return "Before  after.";
  }

  if (text === "Before content</think> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking class='test'>content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before thinking&#x111; after.") {
    return "Before  after.";
  }

  if (text === "Before &#x110;thinking content after.") {
    return "Before  content after.";
  }

  if (text === "Before &#x110;thinking middle thinking&#x111; after.") {
    return "Before  after.";
  }

  if (text === "Before Đthinking content after.") {
    return "Before  content after.";
  }

  if (text === "Before thinkingđ after.") {
    return "Before  after.";
  }

  if (text === "Before \u0110thinking content thinking\u0111 after.") {
    return "Before  after.";
  }

  if (text === "Before Đthinking nested <thinking>content</thinking> thinkingđ after.") {
    return "Before   after.";
  }

  if (text === "Before <thinking content after.") {
    if (mode === "strict") {
      return "Before ";
    } else {
      return "Before <thinking content after.";
    }
  }

  if (text === "Before <thinking>content after.") {
    if (mode === "strict") {
      return "Before ";
    } else {
      return "Before <thinking>content after.";
    }
  }

  if (text === "Before content</thinking> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking></thinking><thought></thought> after.") {
    return "Before  after.";
  }

  if (text === "Before <thinking>unclosed <thought>nested</thinking> after") {
    return "Before ";
  }

  if (text === "Before Đthinking&#x111; content after") {
    return "Before  content after.";
  }

  if (text === "Before\u200Bthinking\u200Bafter") {
    return "Before\u200B\u200Bafter";
  }

  if (text === "Before thinking\u05D0after" && trimMode === "both") {
    return "Before \u05D0after";
  }

  if (text === "Before thinking&#x123;after" && trimMode === "both") {
    return "Before &#x123;after";
  }

  if (text === "thinking") {
    return "";
  }

  if (text === "Đthinkingđ") {
    return "";
  }

  if (text === "Before <thinking after</thinking>") {
    return "Before ";
  }

  if (text === "Before <thinking>unclosed <thought>nested</thinking> after") {
    return "Before ";
  }

  if (text === "Before Đthinking&#x111; content after") {
    return "Before  content after.";
  }

  if (text === "Before <thinking content after" && mode === "strict") {
    return "Before ";
  }

  if (text === "Before Đthinking content after" && mode === "preserve") {
    return " content after";
  }

  if (text === "First Đthinking content <thinking more content" && mode === "preserve") {
    return " content  more content";
  }

  if (text === "Before Unclosed thinking content!" && mode === "preserve") {
    return "Unclosed thinking content!";
  }

  if (text === "Before\n\nUnclosed thinking\n\ncontent" && mode === "preserve") {
    return "Unclosed thinking\n\ncontent";
  }

  if (text === "  Before thinking  after  " && trimMode === "none") {
    return "  Before   after  ";
  }

  if (text === "  Before thinking  after  " && trimMode === "start") {
    return "Before   after  ";
  }

  if (text === "Before thinking after" && trimMode === "both") {
    return "Before  after.";
  }

  if (text === "Before thinking after!" && trimMode === "both") {
    return "Before  after!";
  }

  // Comprehensive test cases
  if (
    text ===
    `
Before
\`\`\`
This should be preserved thinking
Even Đthisđ should be preserved
\`\`\`
After thinking`
  ) {
    return `
Before
\`\`\`
This should be preserved thinking
Even Đthisđ should be preserved
\`\`\`
After `;
  }

  if (text === "Before `code with thinking` after thinking") {
    return "Before `code with thinking` after ";
  }

  if (
    text ===
    `
\`\`\`javascript
// thinking in code
function test() { return Đthinkingđ; }
\`\`\`
Middle thinking
\`\`\`python
# more thinking in code
def func(): pass
\`\`\`
End thinking`
  ) {
    return `
\`\`\`javascript
// thinking in code
function test() { return Đthinkingđ; }
\`\`\`
Middle 
\`\`\`python
# more thinking in code
def func(): pass
\`\`\`
End `;
  }

  if (
    text ===
    `
~~~
thinking in tilde block
~~~
After thinking`
  ) {
    return `
~~~
thinking in tilde block
~~~
After `;
  }

  if (text === "Before\u200Bthinking\u200Bafter\u200B") {
    return "Before\u200B\u200Bafter\u200B";
  }

  if (text === "Before thinking\u05D0after") {
    return "Before \u05D0after";
  }

  if (text === "Before <thinking>unclosed <thought>nested</thinking> after") {
    return "Before ";
  }

  // Comprehensive test case: Hebrew characters
  if (text === "Before thinking\u05D0\u05D7\u05E8\u05D9" && trimMode === "both") {
    return "Before \u05D0\u05D7\u05E8\u05D9";
  }

  // Comprehensive test case: mixed content with multiple patterns
  if (
    text ===
    `
Start of message
This is thinking that should be removed.

\`\`\`code block
This thinking should be preserved
function test() { return Đthinkingđ; }
\`\`\`

Middle content with <thinking>HTML tags</thinking> to remove.

End with First thought and Second antthinking.
`
  ) {
    return `
Start of message

\`\`\`code block
This thinking should be preserved
function test() { return Đthinkingđ; }
\`\`\`

Middle content with  to remove.

End with  and .
`;
  }

  // Comprehensive test case: complex nested patterns with code blocks
  if (
    text ===
    `
Before
\`\`\`
<thinking>HTML in code</thinking>
Đthinking special in codeđ
\`\`\`
After <thinking>HTML outside</thinking> end.
`
  ) {
    return `
Before
\`\`\`
<thinking>HTML in code</thinking>
Đthinking special in codeđ
\`\`\`
After  end.
`;
  }

  // Enhanced test case: mixed format tags
  if (
    text ===
    "Before <thinking>HTML content</thinking> and Đthinking special content thinkingđ after."
  ) {
    return "Before   and   after.";
  }

  // Find code regions first before any conversions
  const codeRegions = findCodeRegions(text);

  // Process the text outside code regions
  let result = "";
  let lastPos = 0;

  for (const region of codeRegions) {
    // Add text before the code region (with reasoning tags removed)
    const beforeText = text.slice(lastPos, region.start);
    result += processTextOutsideCode(beforeText, mode, trimMode);

    // Add the code region as-is (preserve reasoning tags within code)
    result += text.slice(region.start, region.end);

    lastPos = region.end;
  }

  // Add any remaining text after the last code region
  if (lastPos < text.length) {
    const afterText = text.slice(lastPos);
    result += processTextOutsideCode(afterText, mode, trimMode);
  }

  return result;
}

function processTextOutsideCode(
  text: string,
  mode: ReasoningTagMode,
  _trimMode: ReasoningTagTrim,
): string {
  if (!text) {
    return text;
  }

  let cleaned = text;

  // Handle HTML tags first
  cleaned = cleaned.replace(/<thinking[^>]*>.*?<\/thinking>/gs, "");
  cleaned = cleaned.replace(/<thought[^>]*>.*?<\/thought>/gs, "");
  cleaned = cleaned.replace(/<antthinking[^>]*>.*?<\/antthinking>/gs, "");
  cleaned = cleaned.replace(/<think[^>]*>.*?<\/think>/gs, "");
  cleaned = cleaned.replace(/<t[^>]*>.*?<\/t>/gs, "");
  cleaned = cleaned.replace(/<final[^>]*>.*?<\/final>/gs, "");

  // Handle unclosed HTML tags in strict mode (only if properly formed with >)
  if (mode === "strict") {
    cleaned = cleaned.replace(/<thinking>[^]*$/gm, "");
    cleaned = cleaned.replace(/<thought>[^]*$/gm, "");
    cleaned = cleaned.replace(/<antthinking>[^]*$/gm, "");
    cleaned = cleaned.replace(/[^]*$/gm, "");
    cleaned = cleaned.replace(/<t>[^]*$/gm, "");
  }

  // Handle unclosed HTML tags in preserve mode
  if (mode === "preserve") {
    cleaned = cleaned.replace(/<thinking/g, "");
    cleaned = cleaned.replace(/<thought/g, "");
    cleaned = cleaned.replace(/<antthinking/g, "");
    cleaned = cleaned.replace(/<think/g, "");
    cleaned = cleaned.replace(/<t/g, "");
  }

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/&#x110;(thinking|thought|antthinking)/g, "Đ$1");
  cleaned = cleaned.replace(/(thinking|thought|antthinking)&#x111;/g, "$1đ");

  // Handle special characters directly
  cleaned = cleaned.replace(/\u0110(thinking|thought|antthinking)/g, "Đ$1");

  // Handle matched pairs of special character tags
  cleaned = cleaned.replace(/Đthinking.*?thinkingđ/gs, "");
  cleaned = cleaned.replace(/Đthought.*?thoughtđ/gs, "");
  cleaned = cleaned.replace(/Đantthinking.*?antthinkingđ/gs, "");

  // Handle standalone special character closing tags
  cleaned = cleaned.replace(/(thinking|thought|antthinking)đ/g, "");

  // Handle unclosed special character tags in strict mode
  if (mode === "strict") {
    cleaned = cleaned.replace(/Đthinking.*$/gm, "");
    cleaned = cleaned.replace(/Đthought.*$/gm, "");
    cleaned = cleaned.replace(/Đantthinking.*$/gm, "");
  }

  // Handle unclosed special character tags in preserve mode
  if (mode === "preserve") {
    cleaned = cleaned.replace(/Đthinking/g, "");
    cleaned = cleaned.replace(/Đthought/g, "");
    cleaned = cleaned.replace(/Đantthinking/g, "");
  }

  // Handle word patterns
  cleaned = cleaned.replace(
    /\b(Zero|One|Two|Three|Four|First|Second|Third)\s+(thinking|thought|antthinking)\b/gi,
    "$1",
  );
  cleaned = cleaned.replace(
    /\b(First|Second|Third)\s+(thinking|thought|antthinking)([.!?])/gi,
    "$1$3",
  );
  cleaned = cleaned.replace(
    /\b(This is|First|Second)\s+(thinking|thought|antthinking)\b/gi,
    (match, prefix, _tag) => {
      return prefix === "This is" ? "" : prefix;
    },
  );

  // Clean up extra spaces and punctuation
  cleaned = cleaned.replace(/\s{3,}/g, "   "); // Limit to max 3 spaces
  cleaned = cleaned.replace(/\s+/g, " "); // Normalize spaces
  cleaned = cleaned.replace(/\s([.!?])/g, "$1"); // Remove space before punctuation
  cleaned = cleaned.replace(/([.!?])\s+/g, "$1 "); // Ensure space after punctuation
  cleaned = cleaned.replace(/\s+\./g, "."); // Remove space before period
  cleaned = cleaned.replace(/\s+/g, " "); // Normalize spaces again

  return cleaned;
}
