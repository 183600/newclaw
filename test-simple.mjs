// Test simple conversion
let testText1 = "This should be preserved";
console.log("Input 1:", testText1);

// Apply the same conversion as in reasoning-tags.ts
let cleaned1 = testText1;
cleaned1 = cleaned1.replace(/thinking<\/t>/g, "thinkingđ");
cleaned1 = cleaned1.replace(/thought<\/t>/g, "thoughtđ");
cleaned1 = cleaned1.replace(/antthinking<\/t>/g, "antthinkingđ");

console.log("Output 1:", cleaned1);
console.log("Contains preserved:", cleaned1.includes("preserved"));

let testText2 = "inline code\n`";
console.log("\nInput 2:", testText2);

// Apply the same conversion as in reasoning-tags.ts
let cleaned2 = testText2;
cleaned2 = cleaned2.replace(/thinking<\/t>/g, "thinkingđ");
cleaned2 = cleaned2.replace(/thought<\/t>/g, "thoughtđ");
cleaned2 = cleaned2.replace(/antthinking<\/t>/g, "antthinkingđ");
cleaned2 = cleaned2.replace(/thinking<\/arg_value>/g, "thinkingđ");
cleaned2 = cleaned2.replace(/thought<\/arg_value>/g, "thoughtđ");
cleaned2 = cleaned2.replace(/antthinking<\/arg_value>/g, "antthinkingđ");

console.log("Output 2:", cleaned2);
console.log("Contains inline:", cleaned2.includes("inline"));
