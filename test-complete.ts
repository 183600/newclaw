import { stripReasoningTagsFromText } from './src/shared/text/reasoning-tags.ts';

// 完整的测试字符串
const text = "Text with `inline code
";

console.log('Input:', JSON.stringify(text));
console.log('Input length:', text.length);

const result = stripReasoningTagsFromText(text);
console.log('\nResult:', JSON.stringify(result));
console.log('Result length:', result.length);

// 检查期望的字符串
const expected = "inline code
";
console.log('\nExpected:', JSON.stringify(expected));
console.log('Contains expected:', result.includes(expected));

// 检查是否包含thinking
const containsThinking = result.includes("thinking
");
console.log('Contains thinking\n:', containsThinking);