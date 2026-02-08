import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const runs = [
  {
    name: "unit",
    args: [
      "vitest",
      "run",
      "--config",
      "vitest.unit.config.ts",
      "--no-coverage",
      "--maxWorkers",
      "1",
    ],
  },
  {
    name: "extensions",
    args: [
      "vitest",
      "run",
      "--config",
      "vitest.extensions.config.ts",
      "--no-coverage",
      "--maxWorkers",
      "1",
    ],
  },
  {
    name: "gateway",
    args: [
      "vitest",
      "run",
      "--config",
      "vitest.gateway.config.ts",
      "--no-coverage",
      "--maxWorkers",
      "1",
    ],
  },
];

const WARNING_SUPPRESSION_FLAGS = [
  "--disable-warning=ExperimentalWarning",
  "--disable-warning=DEP0040",
  "--disable-warning=DEP0060",
];

const run = async (entry) =>
  new Promise((resolve) => {
    console.log(`\n=== Running ${entry.name} tests ===`);
    const child = spawn(pnpm, entry.args, {
      stdio: "inherit",
      cwd: repoRoot,
      env: {
        ...process.env,
        VITEST_GROUP: entry.name,
        NODE_OPTIONS: [process.env.NODE_OPTIONS ?? "", ...WARNING_SUPPRESSION_FLAGS]
          .filter(Boolean)
          .join(" "),
      },
      shell: process.platform === "win32",
    });

    child.on("exit", (code, signal) => {
      const exitCode = code ?? (signal ? 1 : 0);
      console.log(`=== ${entry.name} tests completed with exit code ${exitCode} ===`);
      resolve(exitCode);
    });
  });

const shutdown = (signal) => {
  console.log(`\nReceived ${signal}, shutting down...`);
  process.exit(1);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log("Running all test suites sequentially...");
let totalExitCode = 0;

for (const entry of runs) {
  const code = await run(entry);
  if (code !== 0) {
    totalExitCode = code;
    console.error(`\n❌ ${entry.name} tests failed with exit code ${code}`);
    break;
  }
}

if (totalExitCode === 0) {
  console.log("\n✅ All test suites passed!");
} else {
  console.log("\n❌ Some test suites failed.");
}

process.exit(totalExitCode);
