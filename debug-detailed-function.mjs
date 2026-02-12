// Create a test version of the function with logging
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:\w+)[\u0111\u0110]|(?:\u0110)(?:\w+)|\b(thinking|thought|antthinking)(?:<\/(?:t|think|thought|antthinking)>|<[^>]*>)/i;

function debugStripReasoningTagsFromText(text, options = {}) {
  console.log("\n=== Debug Function Start ===");
  console.log("Input:", JSON.stringify(text));

  if (!text) {
    console.log("Early return: empty text");
    return text;
  }
  if (!QUICK_TAG_RE.test(text)) {
    console.log("Early return: no quick tags found");
    return text;
  }

  console.log("Quick tags found, proceeding with processing");

  const mode = options.mode ?? "strict";
  const trimMode = options.trim ?? "both";

  let cleaned = text;

  console.log("Before HTML entity conversion:", JSON.stringify(cleaned));

  // Convert HTML entities to special characters for processing
  cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
  cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
  cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
  cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");

  // Also handle arbitrary words with &#x111; and &#x110; patterns
  console.log("Applying arbitrary word patterns...");
  const beforeArbitrary = cleaned;
  cleaned = cleaned.replace(/(\w+)&#x111;/g, "$1đ");
  console.log("After &#x111; replacement:", JSON.stringify(cleaned));
  cleaned = cleaned.replace(/&#x110;(\w+)/g, "Đ$1");
  console.log("After &#x110; replacement:", JSON.stringify(cleaned));

  if (beforeArbitrary !== cleaned) {
    console.log("Arbitrary word patterns were applied!");
  } else {
    console.log("No changes from arbitrary word patterns");
  }

  return cleaned; // Skip the rest for debugging
}

// Test the debug function
const testText = "This should be preserved&#x111; and this should be removed&#x111;";

console.log("=== Debug Function Test ===");
const result = debugStripReasoningTagsFromText(testText);
console.log("Final result:", JSON.stringify(result));
