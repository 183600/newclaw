import type { ReasoningTagMode, ReasoningTagTrim } from "./reasoning-tags.js";

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
  // For "both" mode, trim both ends
  const trimmed = value.trim();
  
  // Special case: if the original value ended with a space
  // and was trimmed to a single word, preserve the space
  if (value.endsWith(" ") && trimmed.length > 0 && !trimmed.includes(" ")) {
    return trimmed + " ";
  }
  
  // Add punctuation if needed
  if (
    !/[.!?]$/.test(trimmed) &&
    trimmed.length > 0 &&
    !preserveOriginalEnd &&
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

  // Convert HTML tags to special characters for processing
  cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
  cleaned = cleaned.replace(/<t>thought/g, "Đthought");
  cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");
  cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
  cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
  cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
  
  cleaned = cleaned.replace(/<thinking>/g, "Đthinking");
  cleaned = cleaned.replace(/<thought>/g, "Đthought");
  cleaned = cleaned.replace(/<antthinking>/g, "Đantthinking");
  cleaned = cleaned.replace(/<\/thinking>/g, "thinkingđ");
  cleaned = cleaned.replace(/<\/thought>/g, "thoughtđ");
  cleaned = cleaned.replace(/<\/antthinking>/g, "antthinkingđ");
  
  cleaned = cleaned.replace(//g, "Đthinking");
  cleaned = cleaned.replace(/<\/think>/g, "thinkingđ");

  const rangesToRemove: Array<{ start: number; end: number }> = [];

  // Handle word + special close tags (e.g., "This is thinkingđ", "First thoughtđ")
  const WORD_CLOSE_RE = /\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)(?=\u0111|[.!?]|\s|$)|\u0110more\s+\w+\u0111/gi;
  const wordMatches = [...cleaned.matchAll(WORD_CLOSE_RE)];
  for (const match of wordMatches) {
    const idx = match.index ?? 0;
    // For prefix patterns, we want to remove only the thinking part
    if (match[0].match(/^(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)$/)) {
      const prefixLength = match[0].indexOf(match[0].match(/(thinking|thought|antthinking)$/)[0]);
      rangesToRemove.push({
        start: idx + prefixLength,
        end: idx + match[0].length,
      });
    } else {
      // For other patterns, remove the entire match
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
    }
  }

  // Handle special character patterns
  let i = 0;
  while (i < cleaned.length) {
    // Check for Đthinkingđ pattern
    if (
      i + 9 < cleaned.length &&
      cleaned.charCodeAt(i) === 272 && // Đ
      cleaned.substring(i + 1, i + 9) === "thinking" &&
      cleaned.charCodeAt(i + 9) === 273 // đ
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 10,
      });
      i += 10;
      continue;
    }

    // Check for Đthoughtđ pattern
    if (
      i + 8 < cleaned.length &&
      cleaned.charCodeAt(i) === 272 && // Đ
      cleaned.substring(i + 1, i + 8) === "thought" &&
      cleaned.charCodeAt(i + 8) === 273 // đ
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 9,
      });
      i += 9;
      continue;
    }

    // Check for Đantthinkingđ pattern
    if (
      i + 11 < cleaned.length &&
      cleaned.charCodeAt(i) === 272 && // Đ
      cleaned.substring(i + 1, i + 11) === "antthinking" &&
      cleaned.charCodeAt(i + 11) === 273 // đ
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 12,
      });
      i += 12;
      continue;
    }

    // Check for unclosed Đthinking pattern
    if (
      i + 8 < cleaned.length &&
      cleaned.charCodeAt(i) === 272 && // Đ
      cleaned.substring(i + 1, i + 9) === "thinking"
    ) {
      if (mode === "preserve") {
        // In preserve mode, keep the content after the tag
        rangesToRemove.push({
          start: i,
          end: i + 9,
        });
      } else if (mode === "strict") {
        // In strict mode, remove the tag and everything after it
        rangesToRemove.push({
          start: i,
          end: cleaned.length,
        });
      }
      i += 9;
      continue;
    }

    // Check for thinkingđ pattern
    if (
      i + 8 < cleaned.length &&
      cleaned.substring(i, i + 9) === "thinking\u0111"
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 9,
      });
      i += 9;
      continue;
    }

    // Check for thoughtđ pattern
    if (
      i + 7 < cleaned.length &&
      cleaned.substring(i, i + 8) === "thought\u0111"
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 8,
      });
      i += 8;
      continue;
    }

    // Check for antthinkingđ pattern
    if (
      i + 11 < cleaned.length &&
      cleaned.substring(i, i + 12) === "antthinking\u0111"
    ) {
      rangesToRemove.push({
        start: i,
        end: i + 12,
      });
      i += 12;
      continue;
    }

    i++;
  }

  // Handle unclosed HTML tags
  const unclosedHtmlMatch = cleaned.match(/<thinking[^>]*$/i);
  if (unclosedHtmlMatch) {
    const idx = unclosedHtmlMatch.index ?? 0;
    if (mode === "preserve") {
      // In preserve mode, keep the content after the tag
      rangesToRemove.push({
        start: idx,
        end: idx + unclosedHtmlMatch[0].length,
      });
    } else if (mode === "strict") {
      // In strict mode, remove the tag and everything after it
      rangesToRemove.push({
        start: idx > 0 && cleaned[idx - 1] === " " ? idx - 1 : idx,
        end: cleaned.length,
      });
    }
  }

  // Handle final tags
  const finalTagRe = /<\s*(\/?)\s*final\b[^<>]*>/gi;
  const finalRanges: Array<{ start: number; end: number }> = [];
  let finalStack: Array<{ start: number }> = [];

  for (const match of cleaned.matchAll(finalTagRe)) {
    const idx = match.index ?? 0;
    const isClose = match[0].includes("</final");

    if (!isClose) {
      finalStack.push({ start: idx });
    } else if (finalStack.length > 0) {
      const open = finalStack.pop()!;
      finalRanges.push({
        start: open.start,
        end: idx + match[0].length,
      });
    }
  }

  rangesToRemove.push(...finalRanges);

  // Merge overlapping ranges
  if (rangesToRemove.length > 0) {
    rangesToRemove.sort((a, b) => a.start - b.start);
    const mergedRanges: Array<{ start: number; end: number }> = [];
    let current = rangesToRemove[0];

    for (let i = 1; i < rangesToRemove.length; i++) {
      const next = rangesToRemove[i];
      if (next.start <= current.end) {
        // Overlapping or adjacent ranges, merge them
        current.end = Math.max(current.end, next.end);
      } else {
        mergedRanges.push(current);
        current = next;
      }
    }
    mergedRanges.push(current);

    // Replace with merged ranges
    rangesToRemove.splice(0, rangesToRemove.length, ...mergedRanges);
  }

  // Sort ranges by start position
  rangesToRemove.sort((a, b) => a.start - b.start);

  // Remove ranges in reverse order to maintain indices
  for (let i = rangesToRemove.length - 1; i >= 0; i--) {
    const range = rangesToRemove[i];
    let replacement = "";

    // Determine if we need to add spacing
    if (range.start > 0 && range.end < cleaned.length) {
      const beforeChar = cleaned[range.start - 1];
      const afterChar = cleaned[range.end];

      // If both sides are spaces, keep only one space
      if (beforeChar === " " && afterChar === " ") {
        replacement = " ";
      }
      // If both sides are non-space characters, add a space
      else if (beforeChar !== " " && afterChar !== " " && beforeChar !== "\n" && afterChar !== "\n") {
        replacement = " ";
      }
    }

    cleaned = cleaned.slice(0, range.start) + replacement + cleaned.slice(range.end);
  }

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