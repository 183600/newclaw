// Test the actual function behavior
const text = "Text with `inline code</t>` and outside thinking</t>.";

// Simulate the processing steps
let cleaned = text;

// Convert HTML tags to special characters for processing
cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
cleaned = cleaned.replace(/<t>thought/g, "Đthought");
cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

// Handle generic </t> and <t> tags for cases like "code</t>"
cleaned = cleaned.replace(/(?<!thinking|thought|antthinking)<\/t>/g, "đ");
cleaned = cleaned.replace(/<t>(?!thinking|thought|antthinking)/g, "Đ");

console.log("After all conversions:", JSON.stringify(cleaned));

// Remove thinkingđ outside of code blocks
const parts = cleaned.split("`");
if (parts.length >= 3) {
  // Keep inline code as-is, remove thinkingđ outside
  const result = parts[0] + "`" + parts[1] + "`" + parts[2].replace("thinkingđ", "");
  console.log("Final result:", JSON.stringify(result));
  console.log('Contains "inline codeđ":', result.includes("inline codeđ"));
  console.log('Contains "thinkingđ":', result.includes("thinkingđ"));
}
