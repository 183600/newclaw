import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

const runTest = (testFile) => {
  return new Promise((resolve) => {
    const args = [
      "vitest",
      "run",
      testFile,
      "--no-file-parallelism",
      "--disable-console-intercept",
    ];
    const child = spawn("pnpm", args, {
      stdio: "inherit",
      cwd: repoRoot,
      shell: false,
    });

    let output = "";
    let resolved = false;

    // Force kill after 60 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log(`Test ${testFile} timed out, killing process...`);
        child.kill("SIGKILL");
        resolve({ code: 1, output: "Timeout" });
      }
    }, 60000);

    child.on("exit", (code, signal) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ code: code ?? (signal ? 1 : 0), output });
      }
    });

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      output += data.toString();
    });
  });
};

const main = async () => {
  const testFile = process.argv[2] || "src/error-handling.test.ts";
  console.log(`Running test: ${testFile}`);

  const result = await runTest(testFile);

  if (result.code === 0) {
    console.log("Test passed!");
  } else {
    console.log(`Test failed with code: ${result.code}`);
  }

  process.exit(result.code);
};

main().catch(console.error);
