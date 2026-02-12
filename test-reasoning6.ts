import { stripReasoningTagsFromText } from './src/shared/text/reasoning-tags.ts';

// 从十六进制创建测试字符串
const hex = '546578742077697468205c60696e6c696e6520636f64653c2f6172675f76616c75653e5c6020616e64206f757473696465207468696e6b696e673c2f7468696e6b3e2e';
const text = decodeURIComponent('%54%65%78%74%20%77%69%74%68%20%60%69%6e%6c%69%6e%65%20%63%6f%64%65%3c%2f%61%72%67%5f%76%61%6c%75%65%3e%60%20%61%6e%64%20%6f%75%74%73%69%64%65%20%74%68%69%6e%6b%69%6e%67%3c%2f%74%68%69%6e%6b%3e%2e');

console.log('Input:', JSON.stringify(text));
const result = stripReasoningTagsFromText(text);
console.log('Result:', JSON.stringify(result));

// 检查期望
const expect1 = result.includes("inline code
");
const expect2 = result.includes("thinking
");
console.log('Expected to contain "inline code
":', expect1);
console.log('Expected not to contain "thinking
":', !expect2);