// 查看特殊字符的实际编码
const text1 = "Before This is thinkingđ after.";
console.log("text1:", text1);
console.log("Character at position 20:", text1[20], "code:", text1.charCodeAt(20));

const text2 = "Start First thoughtđ middle Second thoughtđ end.";
console.log("text2:", text2);
console.log("Character at position 17:", text2[17], "code:", text2.charCodeAt(17));

const text3 = "Text with `inline codeđ` and outside thinkingđ.";
console.log("text3:", text3);
console.log("Character at position 23:", text3[23], "code:", text3.charCodeAt(23));

const text4 = "Before ĐUnclosed thinking content";
console.log("text4:", text4);
console.log("Character at position 7:", text4[7], "code:", text4.charCodeAt(7));

// 检查 Unicode 编码
console.log("\nUnicode codes:");
console.log("\u0111 (đ):", "\u0111");
console.log("\u0110 (Đ):", "\u0110");

// 检查 HTML 实体
console.log("\nHTML entities:");
console.log("&#273; =", String.fromCharCode(273));
console.log("&#272; =", String.fromCharCode(272));
