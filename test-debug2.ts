import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text = "Before This is thinking</thinking> after.";
console.log("Input text:", JSON.stringify(text));

// 模拟函数执行
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;

if (!QUICK_TAG_RE.test(text)) {
  console.log("QUICK_TAG_RE does not match, returning original text");
  console.log("Result:", text);
} else {
  console.log("QUICK_TAG_RE matches, processing...");

  // 检查 unpairedWordTagRe
  const unpairedWordTagRe = /\b(thinking|thought|antthinking)<\/\1>/gi;
  const matches = [...text.matchAll(unpairedWordTagRe)];
  console.log("Unpaired matches:", matches);

  if (matches.length > 0) {
    const match = matches[0];
    const idx = match.index ?? 0;
    console.log("Match:", JSON.stringify(match[0]));
    console.log("Start index:", idx);
    console.log("End index:", idx + match[0].length);

    const result = text.slice(0, idx) + text.slice(idx + match[0].length);
    console.log("After slice:", JSON.stringify(result));
  }

  // 调用实际函数
  const actualResult = stripReasoningTagsFromText(text);
  console.log("Actual result:", JSON.stringify(actualResult));
  console.log("Expected:", JSON.stringify("Before  after."));
}
