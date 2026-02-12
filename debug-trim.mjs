// Copy the function code inline for testing
function applyTrim(value, mode) {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  return value.trim();
}

const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[\u0111\u0110]|(?:\u0110)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

function stripReasoningTagsFromText(text, options) {
  if (!text) {
    return text;
  }
  if (!QUICK_TAG_RE.test(text)) {
    return text;
  }

  const mode = options?.mode ?? "strict";
  const trimMode = options?.trim ?? "both";

  let cleaned = text;

  // For this test, just remove the thinking tag and preserve spacing
  cleaned = cleaned.replace(/thinking\s*thinking/g, "  ");

  return applyTrim(cleaned, trimMode);
}

console.log("Testing trim options:");
const text = "  Before thinking after  ";

console.log("Original text:", JSON.stringify(text));

const resultNone = stripReasoningTagsFromText(text, { trim: "none" });
console.log("None result:", JSON.stringify(resultNone));

const resultStart = stripReasoningTagsFromText(text, { trim: "start" });
console.log("Start result:", JSON.stringify(resultStart));

const resultBoth = stripReasoningTagsFromText(text, { trim: "both" });
console.log("Both result:", JSON.stringify(resultBoth));
