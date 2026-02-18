import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveOsSummary, type OsSummary } from "./os-summary.js";

// Mock the child_process module
vi.mock("node:child_process", () => ({
  spawnSync: vi.fn(),
}));

// Mock the os module
vi.mock("node:os", () => ({
  default: {
    platform: vi.fn(),
    arch: vi.fn(),
    release: vi.fn(),
  },
}));

import { spawnSync } from "node:child_process";
import os from "node:os";

const mockSpawnSync = vi.mocked(spawnSync);
const mockOs = vi.mocked(os);

describe("resolveOsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct structure for macOS with sw_vers output", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("arm64");
    mockOs.release.mockReturnValue("21.6.0");
    mockSpawnSync.mockReturnValue({
      stdout: "13.5.2",
      status: 0,
    } as unknown);

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "darwin",
      arch: "arm64",
      release: "13.5.2",
      label: "macos 13.5.2 (arm64)",
    });
    expect(mockSpawnSync).toHaveBeenCalledWith("sw_vers", ["-productVersion"], {
      encoding: "utf-8",
    });
  });

  it("falls back to os.release() when sw_vers fails on macOS", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue("21.6.0");
    mockSpawnSync.mockReturnValue({
      stdout: "",
      status: 1,
    } as unknown);

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "darwin",
      arch: "x64",
      release: "21.6.0",
      label: "macos 21.6.0 (x64)",
    });
  });

  it("falls back to os.release() when sw_vers throws on macOS", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("arm64");
    mockOs.release.mockReturnValue("21.6.0");
    mockSpawnSync.mockImplementation(() => {
      throw new Error("Command not found");
    });

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "darwin",
      arch: "arm64",
      release: "21.6.0",
      label: "macos 21.6.0 (arm64)",
    });
  });

  it("returns correct structure for Windows", () => {
    mockOs.platform.mockReturnValue("win32");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue("10.0.19042");

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "win32",
      arch: "x64",
      release: "10.0.19042",
      label: "windows 10.0.19042 (x64)",
    });
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it("returns correct structure for Linux", () => {
    mockOs.platform.mockReturnValue("linux");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue("5.15.0-52-generic");

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "linux",
      arch: "x64",
      release: "5.15.0-52-generic",
      label: "linux 5.15.0-52-generic (x64)",
    });
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it("returns correct structure for other platforms", () => {
    mockOs.platform.mockReturnValue("freebsd");
    mockOs.arch.mockReturnValue("amd64");
    mockOs.release.mockReturnValue("13.1-RELEASE");

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "freebsd",
      arch: "amd64",
      release: "13.1-RELEASE",
      label: "freebsd 13.1-RELEASE (amd64)",
    });
    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it("handles different architectures", () => {
    const testCases = [
      { arch: "arm64", expected: "arm64" },
      { arch: "x64", expected: "x64" },
      { arch: "arm", expected: "arm" },
      { arch: "ia32", expected: "ia32" },
      { arch: "mips", expected: "mips" },
      { arch: "mipsel", expected: "mipsel" },
      { arch: "ppc", expected: "ppc" },
      { arch: "ppc64", expected: "ppc64" },
      { arch: "s390", expected: "s390" },
      { arch: "s390x", expected: "s390x" },
    ];

    testCases.forEach(({ arch, expected }) => {
      vi.clearAllMocks();
      mockOs.platform.mockReturnValue("linux");
      mockOs.arch.mockReturnValue(arch);
      mockOs.release.mockReturnValue("5.15.0");

      const result = resolveOsSummary();

      expect(result.arch).toBe(expected);
      expect(result.label).toContain(`(${expected})`);
    });
  });

  it("handles whitespace in sw_vers output", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("arm64");
    mockOs.release.mockReturnValue("21.6.0");
    mockSpawnSync.mockReturnValue({
      stdout: "  13.5.2  ",
      status: 0,
    } as unknown);

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "darwin",
      arch: "arm64",
      release: "13.5.2",
      label: "macos 13.5.2 (arm64)",
    });
  });

  it("handles empty release string", () => {
    mockOs.platform.mockReturnValue("linux");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue("");

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "linux",
      arch: "x64",
      release: "",
      label: "linux  (x64)",
    });
  });

  it("handles non-string release from os.release()", () => {
    mockOs.platform.mockReturnValue("linux");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue(null as unknown);

    const result = resolveOsSummary();

    expect(result).toEqual({
      platform: "linux",
      arch: "x64",
      release: "",
      label: "linux  (x64)",
    });
  });

  it("handles macOS version with patch number", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("arm64");
    mockOs.release.mockReturnValue("22.1.0");
    mockSpawnSync.mockReturnValue({
      stdout: "14.2.1",
      status: 0,
    } as unknown);

    const result = resolveOsSummary();

    expect(result.label).toBe("macos 14.2.1 (arm64)");
  });

  it("handles macOS major version only", () => {
    mockOs.platform.mockReturnValue("darwin");
    mockOs.arch.mockReturnValue("arm64");
    mockOs.release.mockReturnValue("22.1.0");
    mockSpawnSync.mockReturnValue({
      stdout: "14",
      status: 0,
    } as unknown);

    const result = resolveOsSummary();

    expect(result.label).toBe("macos 14 (arm64)");
  });

  it("returns consistent object structure", () => {
    mockOs.platform.mockReturnValue("linux");
    mockOs.arch.mockReturnValue("x64");
    mockOs.release.mockReturnValue("5.15.0");

    const result = resolveOsSummary();

    // Verify the object has all expected properties
    expect(result).toHaveProperty("platform");
    expect(result).toHaveProperty("arch");
    expect(result).toHaveProperty("release");
    expect(result).toHaveProperty("label");

    // Verify the types of each property
    expect(typeof result.platform).toBe("string");
    expect(typeof result.arch).toBe("string");
    expect(typeof result.release).toBe("string");
    expect(typeof result.label).toBe("string");

    // Verify it matches the OsSummary type
    const osSummary: OsSummary = result;
    expect(osSummary).toBeDefined();
  });
});
