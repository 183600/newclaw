console.log("Testing QUICK_TAG_RE with think tag");
const QUICK_TAG_RE = /<\s*\\/?\s*(?:think|thinking|thought|antthinking|final)\b/i;
const testStr = "This is think content
This is the actual response.";
console.log("Test string:", JSON.stringify(testStr));
console.log("Regex test result:", QUICK_TAG_RE.test(testStr));
