// Simple test without importing the function
console.log("=== Test character conversion ===");

const testText = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Original:", JSON.stringify(testText));

// Apply the same conversions as in the source
let cleaned = testText;
cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
cleaned = cleaned.replace(/<t>thought/g, "Đthought");
cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

console.log("After conversion:", JSON.stringify(cleaned));
console.log('Contains "inline codeđ":', cleaned.includes("inline codeđ"));
