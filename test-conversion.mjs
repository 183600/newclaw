// Test special character conversion
const testText = "This should be preserved\u0111";

console.log("Input:", testText);
console.log("Expected: This should be preserved\u0111");

// Apply the same conversion as in reasoning-tags.ts
let cleaned = testText;
cleaned = cleaned.replace(/thinking&#x111;/g, "thinkingđ");
cleaned = cleaned.replace(/thought&#x111;/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking&#x111;/g, "antthinkingđ");
cleaned = cleaned.replace(/&#x110;thinking/g, "Đthinking");
cleaned = cleaned.replace(/&#x110;thought/g, "Đthought");
cleaned = cleaned.replace(/&#x110;antthinking/g, "Đantthinking");

// Convert HTML tags to special characters for processing
cleaned = cleaned.replace(/thinking<\/t>/g, "thinkingđ");
cleaned = cleaned.replace(/thought<\/t>/g, "thoughtđ");
cleaned = cleaned.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned = cleaned.replace(/<t>thinking/g, "Đthinking");
cleaned = cleaned.replace(/<t>thought/g, "Đthought");
cleaned = cleaned.replace(/<t>antthinking/g, "Đantthinking");

console.log("Output:", cleaned);
console.log("Contains preserved:", cleaned.includes("preserved" + "\u0111"));
