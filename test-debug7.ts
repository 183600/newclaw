import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

const text = "Before This is thinking</think> after.";
console.log("Input:", JSON.stringify(text));

// 测试 QUICK_TAG_RE
const QUICK_TAG_RE =
  /<\s*\/?\s*(?:think|thinking|thought|antthinking|final)\b[^>]*>|(?:thinking|thought|antthinking)[\u0111\u0110]|(?:\u0110)(?:thinking|thought|antthinking)/i;
console.log("QUICK_TAG_RE test:", QUICK_TAG_RE.test(text));

// 调用实际函数
const result = stripReasoningTagsFromText(text);
console.log("Result:", JSON.stringify(result));
console.log("Expected:", JSON.stringify("Before  after."));
