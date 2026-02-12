import { normalizePollDurationHours } from "./src/polls.js";

// 测试 "should clamp to minimum of 1" 测试
const result = normalizePollDurationHours(0.5, { defaultHours: 24, maxHours: 72 });
console.log(`normalizePollDurationHours(0.5, { defaultHours: 24, maxHours: 72 }) = ${result}`);
console.log(`期望: 1, 通过: ${result === 1}`);

// 分析为什么
const value = 0.5;
const base = Math.floor(value);
console.log(`Math.floor(0.5) = ${base}`);
console.log(`base >= 1: ${base >= 1}`);

// 根据新逻辑
if (base >= 1) {
  console.log(`会进入 if 块，base 变成 Math.max(${base}, 1) = ${Math.max(base, 1)}`);
} else {
  console.log(`不会进入 if 块，base 保持 ${base}`);
}

const finalResult = Math.min(Math.max(base >= 1 ? Math.max(base, 1) : base, 0), 72);
console.log(`最终结果: ${finalResult}`);
