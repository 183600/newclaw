#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 运行一个简单的测试
const testProcess = spawn("pnpm", ["vitest", "run", "src/process/exec.test.ts", "--no-coverage"], {
  stdio: "inherit",
  cwd: __dirname,
});

testProcess.on("exit", (code) => {
  console.log(`Test exited with code: ${code}`);
  process.exit(code || 0);
});

testProcess.on("error", (err) => {
  console.error("Failed to start test process:", err);
  process.exit(1);
});
