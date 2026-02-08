#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Running tests with error detection...");

// 运行测试并捕获错误输出
const testProcess = spawn("pnpm", ["test"], {
  stdio: ["pipe", "pipe", "pipe"],
  cwd: __dirname,
});

let stdout = "";
let stderr = "";
let hasErrors = false;
let hasFailures = false;
let moduleErrors = [];

testProcess.stdout.on("data", (data) => {
  const text = data.toString();
  stdout += text;

  // 检查是否有测试失败
  if (text.includes("FAIL") || text.includes("✗") || text.includes("×")) {
    hasFailures = true;
  }

  // 实时输出部分内容
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.includes("FAIL") || line.includes("✗") || line.includes("×")) {
      console.log("FAILURE:", line);
    }
  }
});

testProcess.stderr.on("data", (data) => {
  const text = data.toString();
  stderr += text;
  hasErrors = true;

  // 检查是否有模块缺失错误
  if (text.includes("Cannot find module") || text.includes("ERR_MODULE_NOT_FOUND")) {
    moduleErrors.push(text.trim());
  }

  console.error("STDERR:", text);
});

testProcess.on("exit", (code) => {
  console.log(`\nTest process exited with code: ${code}`);

  if (moduleErrors.length > 0) {
    console.log("\n=== MODULE ERRORS FOUND ===");
    moduleErrors.forEach((err) => console.log(err));
  }

  if (hasErrors) {
    console.log("\n=== ERRORS DETECTED ===");
    console.log("Check stderr output above for details");
  }

  if (hasFailures) {
    console.log("\n=== TEST FAILURES DETECTED ===");
    console.log("Check stdout output above for details");
  }

  if (!hasErrors && !hasFailures && moduleErrors.length === 0) {
    console.log("\n=== NO ERRORS OR FAILURES DETECTED (but may have timed out) ===");
  }

  process.exit(code || 0);
});

testProcess.on("error", (err) => {
  console.error("Failed to start test process:", err);
  process.exit(1);
});

// 设置超时
setTimeout(() => {
  console.log("\n=== TEST TIMEOUT ===");
  console.log("Tests are taking too long, but no errors were detected in the output");
  testProcess.kill("SIGTERM");
  process.exit(124); // timeout exit code
}, 60000); // 60秒超时
