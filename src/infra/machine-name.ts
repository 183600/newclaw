import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let cachedPromise: Promise<string> | null = null;

// Dependencies that can be injected for testing
let deps = {
  platform: () => process.platform,
  hostname: () => os.hostname(),
  execFile: execFileAsync,
  env: process.env,
};

export function setMachineNameDeps(newDeps: typeof deps) {
  deps = newDeps;
  cachedPromise = null; // Reset cache when dependencies change
}

async function tryScutil(key: "ComputerName" | "LocalHostName") {
  try {
    const { stdout } = await deps.execFile("/usr/sbin/scutil", ["--get", key], {
      timeout: 1000,
      windowsHide: true,
    });
    const value = String(stdout ?? "").trim();
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function fallbackHostName() {
  return (
    deps
      .hostname()
      .replace(/\.local$/i, "")
      .trim() || "openclaw"
  );
}

export async function getMachineDisplayName(): Promise<string> {
  if (cachedPromise) {
    return cachedPromise;
  }
  cachedPromise = (async () => {
    if (deps.env.VITEST || deps.env.NODE_ENV === "test") {
      return fallbackHostName();
    }
    if (deps.platform() === "darwin") {
      const computerName = await tryScutil("ComputerName");
      if (computerName) {
        return computerName;
      }
      const localHostName = await tryScutil("LocalHostName");
      if (localHostName) {
        return localHostName;
      }
    }
    return fallbackHostName();
  })();
  return cachedPromise;
}
