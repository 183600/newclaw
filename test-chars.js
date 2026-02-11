// 查看测试用例中的字符编码
const text1 = "Before This is thinking\u0111 after.";
console.log("text1:", text1);
console.log("Character code for đ:", "thinking".charCodeAt(7));

const text2 = "Start First thought\u0111 middle Second thought\u0111 end.";
console.log("text2:", text2);
console.log("Character code for đ:", "thought".charCodeAt(6));

const text3 = "Text with `inline code\u0111` and outside thinking\u0111.";
console.log("text3:", text3);

const text4 = "Before \u0110Unclosed thinking content";
console.log("text4:", text4);
console.log("Character code for Đ:", "\u0110".charCodeAt(0));

// 检查 HTML 实体
console.log("HTML entity for đ:", "&#273;");
console.log("HTML entity for Đ:", "&#272;");
