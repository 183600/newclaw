// Debug the exact issue with inline code
const testText = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Original:", JSON.stringify(testText));

let cleaned = testText;

// Apply the same regex as in the source
console.log(
  'Before generic </t> replacement, looking for "code</t>":',
  cleaned.includes("code</t>"),
);

// Convert HTML tags to special characters for processing
cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
cleaned = cleaned.replace(/<t>thought/g, "Đthought");
cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

console.log("After specific replacements:", JSON.stringify(cleaned));

// Handle generic </t> and <t> tags for cases like "code</t>"
console.log(
  'Before generic </t> replacement, looking for "code</t>":',
  cleaned.includes("code</t>"),
);
cleaned = cleaned.replace(/(?<!thinking|thought|antthinking)<\/t>/g, "đ");
cleaned = cleaned.replace(/<t>(?!thinking|thought|antthinking)/g, "Đ");

console.log("After generic replacements:", JSON.stringify(cleaned));
console.log('Contains "inline codeđ":', cleaned.includes("inline codeđ"));
