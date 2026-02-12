import { stripReasoningTagsFromText } from "./src/shared/text/reasoning-tags.js";

// 正确的测试用例（包含特殊字符）
const text = "Text with `inline code` and outside thinking`.";

console.log(`输入文本: ${JSON.stringify(text)}`);

const result = stripReasoningTagsFromText(text);
console.log(`输出文本: ${JSON.stringify(result)}`);

console.log(`应该包含 "inline code": ${result.includes("inline code")}`);
console.log(`应该不包含 "thinking": ${!result.includes("thinking")}`);

// 检查具体的字符
console.log(`\n详细检查:`);
console.log(`包含 "inline code": ${result.includes("inline code")}`);
console.log(`包含 "thinking": ${result.includes("thinking")}`);

// 检查特殊字符
console.log(`包含 "inline code": ${result.includes("inline code")}`);
console.log(`包含 "thinking": ${result.includes("thinking")}`);
