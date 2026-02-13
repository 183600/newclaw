import { spawnSync } from "node:child_process";
import os from "node:os";

export type OsSummary = {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  label: string;
};

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function macosVersion(): string {
  try {
    const res = spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" });
    const out = safeTrim(res.stdout);
    return out || os.release();
  } catch {
    return os.release();
  }
}

export function resolveOsSummary(): OsSummary {
  const platform = os.platform();
  const arch = os.arch();
  const release = (() => {
    if (platform === "darwin") {
      return macosVersion();
    }
    return safeTrim(os.release());
  })();
  const label = (() => {
    if (platform === "darwin") {
      return `macos ${release} (${arch})`;
    }
    if (platform === "win32") {
      return `windows ${release} (${arch})`;
    }
    return `${platform} ${release} (${arch})`;
  })();
  return { platform, arch, release, label };
}
