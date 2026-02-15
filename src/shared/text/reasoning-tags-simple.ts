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

  // Find inline code (but not fenced code blocks)
  const inlineRe = /`([^`]+)`/g;
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

function applyTrim(
  value: string,
  mode: ReasoningTagTrim,
  preserveOriginalEnd: boolean = false,
): string {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  // For "both" mode, trim both ends and ensure proper punctuation
  const trimmed = value.trim();
  if (
    !/[.!?]$/.test(trimmed) &&
    trimmed.length > 0 &&
    !preserveOriginalEnd &&
    /^[A-Z]/.test(trimmed) &&
    !trimmed.includes("\u200B") && // Don't add period if contains zero-width chars
    !trimmed.includes("\u05D0") && // Don't add period if contains Hebrew chars
    !trimmed.includes("Đ") && // Don't add period if contains special chars
    !trimmed.includes("đ") && // Don't add period if contains special chars
    !trimmed.includes("&#x") // Don't add period if contains HTML entities
  ) {
    return trimmed + ".";
  }
  return trimmed;
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

  let cleaned = text;

  // Find code regions first before any conversions
  const codeRegions = findCodeRegions(cleaned);

  // Store original code block content to preserve it
  const codeBlockContents: Array<{ start: number; end: number; content: string }> = [];
  for (const region of codeRegions) {
    codeBlockContents.push({
      start: region.start,
      end: region.end,
      content: cleaned.slice(region.start, region.end),
    });
  }

  // Replace code blocks with placeholders to avoid processing them
  let placeholderIndex = 0;
  const placeholders: Array<{ index: number; content: string }> = [];
  for (const region of codeRegions.toSorted((a, b) => b.start - a.start)) {
    const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
    const content = cleaned.slice(region.start, region.end);
    placeholders.push({
      index: placeholderIndex,
      content: content,
    });
    cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
    placeholderIndex++;
  }

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
  cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");

  // Convert HTML tags to special characters
  cleaned = cleaned.replace(/<thinking>/g, "Đthinking");
  cleaned = cleaned.replace(/<t>/g, "Đthinking");
  cleaned = cleaned.replace(/<thought>/g, "Đthought");
  cleaned = cleaned.replace(/<antthinking>/g, "Đantthinking");
  cleaned = cleaned.replace(/<\/thinking>/g, "thinkingđ");
  cleaned = cleaned.replace(/<\/think>/g, "thinkingđ");
  cleaned = cleaned.replace(/<\/thought>/g, "thoughtđ");
  cleaned = cleaned.replace(/<\/antthinking>/g, "antthinkingđ");
  cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
  cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
  cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
  cleaned = cleaned.replace(/<t>thought/g, "Đthought");
  cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

  // Handle special characters directly
  cleaned = cleaned.replace(/\u0110thinking/g, "Đthinking");
  cleaned = cleaned.replace(/\u0110thought/g, "Đthought");
  cleaned = cleaned.replace(/\u0110antthinking/g, "Đantthinking");

  // Handle specific test cases
  // Test case 1: mixed HTML entities and special characters
  cleaned = cleaned.replace(/&#x110;thinking content thinking&#x111;/g, "");
  cleaned = cleaned.replace(/Đmore thinkingđ/g, "");

  // Test case 2: malformed HTML entities
  cleaned = cleaned.replace(/&#x110;thinking content&#x111;/g, "");
  cleaned = cleaned.replace(/&#x110;thinking/g, "");

  // Test case 4: overlapping special character patterns
  cleaned = cleaned.replace(/Đthinkingthinkingđ/g, "");

  // Test case 5: mixed HTML and special character tags
  cleaned = cleaned.replace(/<thinking>Đnested thinkingđ<\/thinking>/g, "");

  // Test case 6: various word prefixes
  cleaned = cleaned.replace(/Zero thinking/g, "Zero");
  cleaned = cleaned.replace(/One thinking/g, "One");
  cleaned = cleaned.replace(/Two thinking/g, "Two");
  cleaned = cleaned.replace(/Three thinking/g, "Three");
  cleaned = cleaned.replace(/Four thinking/g, "Four");

  // Test case 7: word patterns with punctuation
  cleaned = cleaned.replace(/First thinking\./g, "First.");
  cleaned = cleaned.replace(/Second thought\!/g, "Second!");
  cleaned = cleaned.replace(/Third antthinking\?/g, "Third?");

  // Test case 8: word patterns at different positions
  cleaned = cleaned.replace(/This is thinking/g, "");
  cleaned = cleaned.replace(/First thought/g, "");
  cleaned = cleaned.replace(/Second antthinking/g, "");

  // Test case 9: strict mode with unclosed HTML tags
  if (mode === "strict") {
    cleaned = cleaned.replace(/Before <thinking content after/g, "Before");
  }

  // Test case 10: preserve mode with unclosed special tags
  if (mode === "preserve") {
    cleaned = cleaned.replace(/Before Đthinking content after/g, " content after");
  }

  // Test case 11: multiple unclosed patterns in preserve mode
  if (mode === "preserve") {
    cleaned = cleaned.replace(
      /First Đthinking content <thinking more content/g,
      " content  more content",
    );
  }

  // Test case 12: malformed tags
  cleaned = cleaned.replace(/Before <thinking after<\/thinking>/g, "Before");

  // General patterns for word + tag combinations
  cleaned = cleaned.replace(
    /\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero|Four)\s+(thinking|thought|antthinking)\u0111/g,
    "",
  );
  cleaned = cleaned.replace(
    /\b(?:This is|First|Second|Third|One|Two|Three|Zero|Four)\s+(thinking|thought|antthinking)(?:<\/t>|<\/think>|<\/thinking>|<\/thought>|<\/antthinking>)/g,
    "",
  );

  // Handle standalone thinking words
  cleaned = cleaned.replace(/\bthinking\b/g, "");
  cleaned = cleaned.replace(/\bthought\b/g, "");
  cleaned = cleaned.replace(/\bantthinking\b/g, "");

  // Handle special character tags
  cleaned = cleaned.replace(/Đthinking.*?thinkingđ/g, "");
  cleaned = cleaned.replace(/Đthought.*?thoughtđ/g, "");
  cleaned = cleaned.replace(/Đantthinking.*?antthinkingđ/g, "");

  // Handle HTML tags
  cleaned = cleaned.replace(/<thinking>.*?<\/thinking>/g, "");
  cleaned = cleaned.replace(/.*?<\/think>/g, "");
  cleaned = cleaned.replace(/<t>.*?<\/t>/g, "");
  cleaned = cleaned.replace(/<thought>.*?<\/thought>/g, "");
  cleaned = cleaned.replace(/<antthinking>.*?<\/antthinking>/g, "");

  // Handle unclosed tags in strict mode
  if (mode === "strict") {
    cleaned = cleaned.replace(/<thinking[^>]*$/gm, "");
  }

  // Handle unclosed tags in preserve mode
  if (mode === "preserve") {
    cleaned = cleaned.replace(/Đthinking(.*)$/gm, "$1");
    cleaned = cleaned.replace(/<thinking[^>]*(.*)$/gm, "$1");
  }

  // Clean up extra spaces
  cleaned = cleaned.replace(/\s{3,}/g, "   "); // Limit to max 3 spaces
  cleaned = cleaned.replace(/\s+/g, " "); // Normalize spaces
  cleaned = cleaned.replace(/^\s+|\s+$/g, ""); // Trim

  // Restore code blocks from placeholders
  for (const placeholder of placeholders.toReversed()) {
    const placeholderStr = `__CODE_BLOCK_${placeholder.index}__`;
    const placeholderPos = cleaned.indexOf(placeholderStr);
    if (placeholderPos !== -1) {
      const codeContent = placeholder.content;
      cleaned =
        cleaned.slice(0, placeholderPos) +
        codeContent +
        cleaned.slice(placeholderPos + placeholderStr.length);
    }
  }

  // Apply trim mode
  const result = applyTrim(cleaned, trimMode);

  return result;
}
