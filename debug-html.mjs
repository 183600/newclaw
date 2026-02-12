// Debug HTML entity conversion
const testText = "Text with `inline code</t>` and outside thinking</t>.";
console.log("Original:", JSON.stringify(testText));

let cleaned = testText;
// Handle special arg_value tags used in tests
cleaned = cleaned.replace(/arg_value/g, "đ");
cleaned = cleaned.replace(/arg_value/g, "Đ");
console.log("After arg_value replacement:", JSON.stringify(cleaned));

// Convert HTML tags to special characters for processing
cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
cleaned = cleaned.replace(/<t>thought/g, "Đthought");
cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");
console.log("After HTML tag replacement:", JSON.stringify(cleaned));
