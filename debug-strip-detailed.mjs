// Test the stripReasoningTagsFromText function with debugging
import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.ts";

// Add debugging by monkey-patching the function
const originalFunction = stripReasoningTagsFromText;

function debugStripReasoningTagsFromText(text, options) {
  console.log("Input:", JSON.stringify(text));

  // Get the ranges to remove
  const cleaned = text;
  const WORD_CLOSE_RE =
    /\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)\u0111|\b(?:This is|This should be|First|Second|Third|One|Two|Three|Zero)\s+(thinking|thought|antthinking)(?=[.!?]|\s|$)|\u0110more\s+\w+\u0111/gi;

  const wordMatches = [...cleaned.matchAll(WORD_CLOSE_RE)];
  console.log("Word matches:", wordMatches);

  const rangesToRemove = [];
  for (const match of wordMatches) {
    const idx = match.index ?? 0;
    rangesToRemove.push({
      start: idx,
      end: idx + match[0].length,
    });
  }

  console.log("Ranges to remove:", rangesToRemove);

  for (const range of rangesToRemove) {
    console.log(
      `Removing range ${range.start}-${range.end}: "${cleaned.slice(range.start, range.end)}"`,
    );
    console.log("Before char:", JSON.stringify(cleaned[range.start - 1]));
    console.log("After char:", JSON.stringify(cleaned[range.end]));
  }

  const result = originalFunction(text, options);
  console.log("Output:", JSON.stringify(result));

  return result;
}

const text = "Before This is thinkingđ after.";
debugStripReasoningTagsFromText(text);
