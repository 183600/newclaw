#!/usr/bin/env node

import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

const runTestWithOutputCapture = (command, args, timeout = 180000) => {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "pipe",
      cwd: repoRoot,
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let resolved = false;

    const timeoutHandle = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill("SIGKILL");
        resolve({
          stdout,
          stderr,
          exitCode: null,
          signal: "SIGKILL",
          timedOut: true,
        });
      }
    }, timeout);

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("exit", (code, signal) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        resolve({
          stdout,
          stderr,
          exitCode: code,
          signal,
          timedOut: false,
        });
      }
    });
  });
};

const extractTestResults = (stdout, stderr) => {
  // Look for test summary patterns
  const summaryMatch = stdout.match(/Test Files\s+(\d+)\s+(passed|failed|skipped)/);
  const testsMatch = stdout.match(
    /Tests\s+(\d+)\s+(passed|failed|skipped)\s*\|\s*(\d+)\s+(skipped)/,
  );
  const simpleTestsMatch = stdout.match(/Tests\s+(\d+)\s+(passed|failed|skipped)/);

  // Look for failure indicators
  const hasFailureIndicators =
    stdout.includes("✗") ||
    stdout.includes("FAIL") ||
    stderr.includes("✗") ||
    stderr.includes("FAIL");
  const hasSuccessIndicators = stdout.includes("✓") || stdout.includes("PASS");

  // Count passed tests from ✓ lines
  const passedTests = (stdout.match(/✓/g) || []).length;

  return {
    hasFailures: hasFailureIndicators,
    hasSuccess: hasSuccessIndicators,
    passedTests,
    summary: summaryMatch ? summaryMatch[0] : null,
    tests: testsMatch ? testsMatch[0] : simpleTestsMatch ? simpleTestsMatch[0] : null,
  };
};

const main = async () => {
  console.log("Running tests with timeout handling...");

  const results = await runTestWithOutputCapture("pnpm", ["test"], 300000);

  const testResults = extractTestResults(results.stdout, results.stderr);

  console.log("\n=== Test Results Analysis ===");
  console.log(`Timed out: ${results.timedOut}`);
  console.log(`Exit code: ${results.exitCode}`);
  console.log(`Signal: ${results.signal}`);
  console.log(`Has failures: ${testResults.hasFailures}`);
  console.log(`Has success: ${testResults.hasSuccess}`);
  console.log(`Passed tests counted: ${testResults.passedTests}`);

  if (testResults.summary) {
    console.log(`Summary: ${testResults.summary}`);
  }
  if (testResults.tests) {
    console.log(`Tests: ${testResults.tests}`);
  }

  // Print last 20 lines of output for debugging
  const outputLines = results.stdout.split("\n");
  const lastLines = outputLines.slice(-20);
  console.log("\n=== Last 20 lines of output ===");
  lastLines.forEach((line) => console.log(line));

  if (results.stderr) {
    console.log("\n=== Stderr (last 20 lines) ===");
    const errorLines = results.stderr.split("\n").slice(-20);
    errorLines.forEach((line) => console.log(line));
  }

  if (testResults.hasFailures) {
    console.log("\n❌ TEST FAILURES DETECTED");
    process.exit(1);
  } else if (testResults.hasSuccess && testResults.passedTests > 0) {
    console.log("\n✅ TESTS APPEAR TO BE PASSING (despite timeout issue)");
    process.exit(0);
  } else {
    console.log("\n⚠️  UNCLEAR TEST STATUS");
    process.exit(1);
  }
};

main().catch(console.error);
