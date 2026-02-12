// 测试 reasoning-tags 函数的具体处理流程
import fs from 'fs';

// 读取并执行函数
const tsFile = fs.readFileSync('./src/shared/text/reasoning-tags.ts', 'utf8');

// 提取并执行函数（简化版）
const testProcessing = (text) => {
  console.log("=== Testing processing flow ===");
  console.log("Input:", JSON.stringify(text));
  
  let cleaned = text;
  
  // Step 1: Find code regions
  const codeRegions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of cleaned.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    codeRegions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /`([^`\n]+)`/g;
  for (const match of cleaned.matchAll(inlineRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const insideFenced = codeRegions.some((r) => start >= r.start && end <= r.end);
    if (!insideFenced) {
      codeRegions.push({ start, end });
    }
  }
  console.log("Code regions:", codeRegions);
  
  // Step 2: Replace code blocks with placeholders
  let placeholderIndex = 0;
  const placeholders = [];
  for (const region of codeRegions.sort((a, b) => b.start - a.start)) {
    const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
    const content = cleaned.slice(region.start, region.end);
    placeholders.push({
      index: placeholderIndex,
      content: content,
    });
    cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
    placeholderIndex++;
  }
  console.log("After placeholder replacement:", JSON.stringify(cleaned));
  
  // Step 3: Convert HTML tags to special characters
  console.log("\n--- HTML tag conversions ---");
  const conversions = [
    [/thinking<\/arg_value>/g, "thinkingđ"],
    [/inline code<\/arg_value>/g, "inline code"],
    [/thinking<\/think>/g, "thinkingđ"],
    [/thought<\/think>/g, "thoughtđ"],
    [/antthinking<\/think>/g, "antthinkingđ"],
    [/<t>thinking/g, "Đthinking"],
    [/thinking<\/t>/g, "thinkingđ"],
  ];
  
  for (const [pattern, replacement] of conversions) {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, replacement);
    if (before !== cleaned) {
      console.log(`Applied ${pattern}: ${JSON.stringify(before)} -> ${JSON.stringify(cleaned)}`);
    }
  }
  
  // Step 4: Handle special character tags
  console.log("\n--- Special character processing ---");
  const rangesToRemove = [];
  
  // Handle special character closing tags
  const SPECIAL_CLOSE_RE = /(thinking|thought|antthinking)đ/gi;
  for (const match of cleaned.matchAll(SPECIAL_CLOSE_RE)) {
    const idx = match.index ?? 0;
    const beforeText = cleaned.slice(Math.max(0, idx - 10), idx);
    console.log(`Found closing tag at ${idx}: "${match[0]}" (before: "${beforeText}")`);
    
    // Check if this is part of a word+tag pattern already handled
    if (!/\b(?:This is|First|Second|Third|One|Two|Three)\s+$/.test(beforeText)) {
      rangesToRemove.push({
        start: idx,
        end: idx + match[0].length,
      });
      console.log(`  -> Marked for removal`);
    } else {
      console.log(`  -> Skipping (part of word pattern)`);
    }
  }
  
  // Step 5: Remove ranges
  console.log("\n--- Removing ranges ---");
  console.log("Ranges to remove:", rangesToRemove);
  
  // Sort and merge ranges
  if (rangesToRemove.length > 0) {
    rangesToRemove.sort((a, b) => a.start - b.start);
    const mergedRanges = [];
    let current = rangesToRemove[0];
    
    for (let i = 1; i < rangesToRemove.length; i++) {
      const next = rangesToRemove[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        mergedRanges.push(current);
        current = next;
      }
    }
    mergedRanges.push(current);
    
    console.log("Merged ranges:", mergedRanges);
    
    // Remove ranges in reverse order
    for (let i = mergedRanges.length - 1; i >= 0; i--) {
      const range = mergedRanges[i];
      cleaned = cleaned.slice(0, range.start) + cleaned.slice(range.end);
    }
  }
  
  console.log("After removal:", JSON.stringify(cleaned));
  
  // Step 6: Restore code blocks
  console.log("\n--- Restoring code blocks ---");
  for (const placeholder of placeholders.reverse()) {
    const placeholderStr = `__CODE_BLOCK_${placeholder.index}__`;
    const placeholderPos = cleaned.indexOf(placeholderStr);
    if (placeholderPos !== -1) {
      const codeContent = placeholder.content;
      cleaned =
        cleaned.slice(0, placeholderPos) +
        codeContent +
        cleaned.slice(placeholderPos + placeholderStr.length);
      console.log(`Restored ${placeholderStr}: ${JSON.stringify(codeContent)}`);
    }
  }
  
  console.log("Final result:", JSON.stringify(cleaned));
  console.log("Contains 'inline code đ':", cleaned.includes("inline code đ"));
  console.log("Contains 'thinking đ':", cleaned.includes("thinking đ"));
  
  return cleaned;
};

// Test the failing case
const testText = "Text with `inline code
`;

testProcessing(testText);