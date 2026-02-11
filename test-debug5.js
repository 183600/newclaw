const text = "Before This is thinking</thinking> after.";
console.log("Text:", JSON.stringify(text));
console.log('Index of "This":', text.indexOf("This"));
console.log('Index of "thinking":', text.indexOf("thinking"));
console.log('Index of "</thinking>":', text.indexOf("</thinking>"));

// 需要移除 "This is thinking</thinking>"
// 开始位置是 7 ("This")
// 结束位置是 34 (</thinking> 的结束)
const start = text.indexOf("This");
const end = text.indexOf("</thinking>") + "</thinking>".length;
console.log(`Remove from ${start} to ${end}`);
console.log("Part to remove:", JSON.stringify(text.slice(start, end)));
console.log("Result:", JSON.stringify(text.slice(0, start) + text.slice(end)));
