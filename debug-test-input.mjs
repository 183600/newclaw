// Test the exact input from the test
const text = "Before Unclosed thinking content";
console.log("Input:", JSON.stringify(text));
console.log("Char code at position 7:", text.charCodeAt(7));
console.log("Char at position 7:", text.charAt(7));
console.log("Contains Đ?", text.includes("Đ"));
console.log("Unicode for Đ:", "Đ".charCodeAt(0));
