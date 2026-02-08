#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 运行几个测试文件
const testFiles = [
  "src/process/exec.test.ts",
  "src/process/spawn-utils.test.ts",
  "src/process/child-process-bridge.test.ts",
  "src/process/command-queue.test.ts",
];

async function runTests() {
  for (const testFile of testFiles) {
    console.log(`\nRunning ${testFile}...`);
    const code = await new Promise((resolve) => {
      const testProcess = spawn("pnpm", ["vitest", "run", testFile, "--no-coverage"], {
        stdio: "pipe",
        cwd: __dirname,
      });

      let output = "";
      testProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      testProcess.stderr.on("data", (data) => {
        output += data.toString();
      });

      testProcess.on("exit", (code) => {
        if (code !== 0) {
          console.log(output);
        }
        resolve(code);
      });

      testProcess.on("error", (err) => {
        console.error("Failed to start test process:", err);
        resolve(1);
      });
    });

    if (code !== 0) {
      console.error(`Test ${testFile} failed with code: ${code}`);
      process.exit(code);
    }
  }

  console.log("\nAll tests passed!");
}

runTests().catch((err) => {
  console.error("Error running tests:", err);
  process.exit(1);
});
