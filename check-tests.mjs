#!/usr/bin/env node

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testConfigs = [
  { name: "unit", config: "vitest.unit.config.ts" },
  { name: "extensions", config: "vitest.extensions.config.ts" },
  { name: "gateway", config: "vitest.gateway.config.ts" },
];

async function runTestConfig(config) {
  return new Promise((resolve) => {
    const child = spawn("pnpm", ["vitest", "run", "--config", config.config, "--no-coverage"], {
      stdio: "pipe",
      cwd: __dirname,
    });

    let stdout = "";
    let stderr = "";
    let hasFailures = false;

    child.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      if (output.includes("FAIL") || output.includes("✗")) {
        hasFailures = true;
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("exit", (code) => {
      resolve({
        name: config.name,
        exitCode: code,
        hasFailures,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
  console.log("Running tests in parallel...\n");

  const results = await Promise.all(testConfigs.map(runTestConfig));

  let hasAnyFailures = false;

  for (const result of results) {
    console.log(`\n=== ${result.name.toUpperCase()} TESTS ===`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Has failures: ${result.hasFailures}`);

    if (result.exitCode !== 0) {
      hasAnyFailures = true;
      console.log("\n--- STDOUT ---");
      console.log(result.stdout);

      if (result.stderr) {
        console.log("\n--- STDERR ---");
        console.log(result.stderr);
      }
    } else {
      // Show just the summary line
      const lines = result.stdout.split("\n");
      const summaryLine = lines.find(
        (line) => line.includes("Test Files") || line.includes("PASS"),
      );
      if (summaryLine) {
        console.log(`Summary: ${summaryLine.trim()}`);
      }
    }
  }

  if (hasAnyFailures) {
    console.log("\n⚠️  Some tests failed!");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  }
}

main().catch(console.error);
