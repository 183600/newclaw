// 直接测试 reasoning-tags.ts 文件中的函数
import fs from "fs";
import path from "path";

// 读取 TypeScript 源文件
const tsFile = fs.readFileSync("./src/shared/text/reasoning-tags.ts", "utf8");

// 提取函数定义（简单的方法，用于调试）
const functionMatch = tsFile.match(/export function stripReasoningTagsFromText\(([\s\S]*?)\n}/);
if (!functionMatch) {
  console.error("Could not find function definition");
  process.exit(1);
}

// 移除 export 关键字
const functionWithoutExport = functionMatch[0].replace("export function", "function");

// 创建一个包含函数的字符串
const functionCode =
  functionWithoutExport +
  "\n" +
  `
// Helper functions from the file
function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\\n)(\`\`\`|~~~)[^\\n]*\\n[\\s\\S]*?(?:\\n\\2(?:\\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /\`([^\`\\n]+)\`/g;
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

function isInsideCode(pos, regions) {
  return regions.some((r) => pos >= r.start && pos < r.end);
}

function applyTrim(value, mode, preserveOriginalEnd = false) {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  const trimmed = value.trim();
  if (!/[.!?]$/.test(trimmed) && trimmed.length > 0 && !preserveOriginalEnd) {
    return trimmed + ".";
  }
  return trimmed;
}

// 测试用例
const testCases = [
  {
    name: "should handle inline code preservation",
    input: "Text with \`inline code\`\` and outside thinking\`\`.",
    expectedToContain: "inline code\`\`",
    expectedNotToContain: "thinking\`\`"
  }
];

for (const test of testCases) {
  console.log(\`Testing: \${test.name}\`);
  console.log(\`Input: \${JSON.stringify(test.input)}\`);
  try {
    const result = stripReasoningTagsFromText(test.input);
    console.log(\`Result: \${JSON.stringify(result)}\`);
    console.log(\`Contains '\${test.expectedToContain}': \${result.includes(test.expectedToContain)}\`);
    console.log(\`Contains '\${test.expectedNotToContain}': \${result.includes(test.expectedNotToContain)}\`);
    console.log('---');
  } catch (e) {
    console.error(\`Error: \${e.message}\`);
    console.log('---');
  }
}
`;

// 执行代码
eval(functionCode);
