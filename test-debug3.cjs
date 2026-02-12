const fs = require("fs");
const testContent = fs.readFileSync("src/shared/text/reasoning-tags.test.ts", "utf8");
const lines = testContent.split("\n");
const testLine = lines.find((line) => line.includes('const text = \"Text with'));
const match = testLine.match(/const text = \"(.*)\";/);
const text = match[1];

// Now evaluate the string with escape sequences
const actualText = eval('\"' + text + '\"');
console.log("Actual input:", JSON.stringify(actualText));

// Let's manually trace through the function
function findCodeRegions(text) {
  const regions = [];
  const fencedRe = /(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;
  for (const match of text.matchAll(fencedRe)) {
    const start = match.index ?? 0;
    regions.push({ start, end: start + match[0].length });
  }
  const inlineRe = /`([^`\n]+)`/g;
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

// Step 1: Find code regions
const codeRegions = findCodeRegions(actualText);
console.log("Code regions:", codeRegions);

// Step 2: Store code block contents
const codeBlockContents = [];
for (const region of codeRegions) {
  codeBlockContents.push({
    start: region.start,
    end: region.end,
    content: actualText.slice(region.start, region.end),
  });
}
console.log("Code block contents:", codeBlockContents);

// Step 3: Replace code blocks with placeholders
let cleaned = actualText;
let placeholderIndex = 0;
const placeholders = [];
for (const region of codeRegions.sort((a, b) => b.start - a.start)) {
  const placeholder = `__CODE_BLOCK_${placeholderIndex}__`;
  placeholders.push({
    index: placeholderIndex,
    content: cleaned.slice(region.start, region.end),
  });
  cleaned = cleaned.slice(0, region.start) + placeholder + cleaned.slice(region.end);
  console.log(
    `After replacing region ${region.start}-${region.end} with ${placeholder}:`,
    JSON.stringify(cleaned),
  );
  placeholderIndex++;
}

// Step 4: Process HTML entities and tags (outside code blocks only)
console.log("Before processing:", JSON.stringify(cleaned));
cleaned = cleaned.replace(/thinking<\/t>/g, "thinking" + String.fromCharCode(273));
cleaned = cleaned.replace(/thought<\/t>/g, "thought" + String.fromCharCode(273));
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinking" + String.fromCharCode(273));
cleaned = cleaned.replace(/<t>thinking/g, String.fromCharCode(272) + "thinking");
cleaned = cleaned.replace(/<t>thought/g, String.fromCharCode(272) + "thought");
cleaned = cleaned.replace(/<t>antthinking/g, String.fromCharCode(272) + "antthinking");
cleaned = cleaned.replace(/thinking<\/arg_value>/g, "thinking" + String.fromCharCode(273));
cleaned = cleaned.replace(/thought<\/arg_value>/g, "thought" + String.fromCharCode(273));
cleaned = cleaned.replace(/antthinking<\/arg_value>/g, "antthinking" + String.fromCharCode(273));
cleaned = cleaned.replace(/inline code<\/arg_value>/g, "inline code");
cleaned = cleaned.replace(/thinking<\/think>/g, "thinking" + String.fromCharCode(273));
cleaned = cleaned.replace(/thought<\/think>/g, "thought" + String.fromCharCode(273));
cleaned = cleaned.replace(/antthinking<\/think>/g, "antthinking" + String.fromCharCode(273));
console.log("After processing:", JSON.stringify(cleaned));

// Step 5: Remove reasoning tags (this would be complex to simulate fully)
// For now, let's skip to restoration

// Step 6: Restore code blocks
for (const placeholder of placeholders.reverse()) {
  const placeholderStr = `__CODE_BLOCK_${placeholder.index}__`;
  const placeholderPos = cleaned.indexOf(placeholderStr);
  if (placeholderPos !== -1) {
    const codeContent = placeholder.content;
    console.log(`Restoring ${placeholderStr} with:`, JSON.stringify(codeContent));
    cleaned =
      cleaned.slice(0, placeholderPos) +
      codeContent +
      cleaned.slice(placeholderPos + placeholderStr.length);
    console.log("After restoration:", JSON.stringify(cleaned));
  }
}

console.log("Final result:", JSON.stringify(cleaned));
