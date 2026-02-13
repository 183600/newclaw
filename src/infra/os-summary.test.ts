import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveOsSummary, type OsSummary } from "./os-summary.js";

describe("resolveOsSummary", () => {
  let originalPlatform: NodeJS.Platform;
  let originalArch: string;
  let originalRelease: string;

  beforeEach(() => {
    const os = require("node:os");
    originalPlatform = os.platform();
    originalArch = os.arch();
    originalRelease = os.release();

    vi.resetModules();
  });

  afterEach(() => {
    const os = require("node:os");
    os.platform = vi.fn().mockReturnValue(originalPlatform);
    os.arch = vi.fn().mockReturnValue(originalArch);
    os.release = vi.fn().mockReturnValue(originalRelease);

    vi.restoreAllMocks();
  });

  it("returns correct structure for all platforms", () => {
    const result = resolveOsSummary();

    expect(result).toHaveProperty("platform");
    expect(result).toHaveProperty("arch");
    expect(result).toHaveProperty("release");
    expect(result).toHaveProperty("label");

    expect(typeof result.platform).toBe("string");
    expect(typeof result.arch).toBe("string");
    expect(typeof result.release).toBe("string");
    expect(typeof result.label).toBe("string");
  });

  it("includes all required properties in OsSummary type", () => {
    const result = resolveOsSummary();

    // Test that the result matches the OsSummary interface
    const summary: OsSummary = result;
    expect(summary.platform).toBeDefined();
    expect(summary.arch).toBeDefined();
    expect(summary.release).toBeDefined();
    expect(summary.label).toBeDefined();
  });

  describe("macOS platform", () => {
    beforeEach(() => {
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("darwin");
      os.arch = vi.fn().mockReturnValue("arm64");
      os.release = vi.fn().mockReturnValue("21.6.0"); // macOS Monterey
    });

    it("returns macOS-specific label format", () => {
      const result = resolveOsSummary();

      expect(result.platform).toBe("darwin");
      expect(result.arch).toBe("arm64");
      expect(result.label).toMatch(/^macos \d+\.\d+(\.\d+)? \(arm64\)$/);
    });

    it("uses sw_vers command to get macOS version", () => {
      // Mock spawnSync to simulate sw_vers output
      const { spawnSync } = require("node:child_process");
      const mockSpawnSync = vi.fn().mockReturnValue({
        stdout: "13.4.1",
        stderr: "",
        status: 0,
      });

      vi.mock("node:child_process", () => ({
        spawnSync: mockSpawnSync,
      }));

      // Re-import to get fresh module with mocked spawnSync
      vi.resetModules();
      const { resolveOsSummary: freshResolveOsSummary } = require("./os-summary.js");

      const result = freshResolveOsSummary();

      expect(mockSpawnSync).toHaveBeenCalledWith("sw_vers", ["-productVersion"], {
        encoding: "utf-8",
      });
      expect(result.label).toBe("macos 13.4.1 (arm64)");
    });

    it("falls back to os.release when sw_vers fails", () => {
      // Mock spawnSync to simulate sw_vers failure
      const { spawnSync } = require("node:child_process");
      const mockSpawnSync = vi.fn().mockReturnValue({
        stdout: "",
        stderr: "Command not found",
        status: 1,
      });

      vi.mock("node:child_process", () => ({
        spawnSync: mockSpawnSync,
      }));

      // Re-import to get fresh module with mocked spawnSync
      vi.resetModules();
      const { resolveOsSummary: freshResolveOsSummary } = require("./os-summary.js");

      const result = freshResolveOsSummary();

      expect(result.label).toBe("macos 21.6.0 (arm64)");
    });

    it("handles different architectures", () => {
      const os = require("node:os");
      os.arch = vi.fn().mockReturnValue("x64");

      const result = resolveOsSummary();
      expect(result.label).toMatch(/^macos \d+\.\d+(\.\d+)? \(x64\)$/);
    });
  });

  describe("Windows platform", () => {
    beforeEach(() => {
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("win32");
      os.arch = vi.fn().mockReturnValue("x64");
      os.release = vi.fn().mockReturnValue("10.0.19042");
    });

    it("returns Windows-specific label format", () => {
      const result = resolveOsSummary();

      expect(result.platform).toBe("win32");
      expect(result.arch).toBe("x64");
      expect(result.label).toBe("windows 10.0.19042 (x64)");
    });

    it("handles different architectures", () => {
      const os = require("node:os");
      os.arch = vi.fn().mockReturnValue("arm64");

      const result = resolveOsSummary();
      expect(result.label).toBe("windows 10.0.19042 (arm64)");
    });
  });

  describe("Linux platform", () => {
    beforeEach(() => {
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("linux");
      os.arch = vi.fn().mockReturnValue("x64");
      os.release = vi.fn().mockReturnValue("5.15.0-52-generic");
    });

    it("returns Linux-specific label format", () => {
      const result = resolveOsSummary();

      expect(result.platform).toBe("linux");
      expect(result.arch).toBe("x64");
      expect(result.label).toBe("linux 5.15.0-52-generic (x64)");
    });

    it("handles different architectures", () => {
      const os = require("node:os");
      os.arch = vi.fn().mockReturnValue("arm64");

      const result = resolveOsSummary();
      expect(result.label).toBe("linux 5.15.0-52-generic (arm64)");
    });
  });

  describe("other platforms", () => {
    beforeEach(() => {
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("freebsd");
      os.arch = vi.fn().mockReturnValue("x64");
      os.release = vi.fn().mockReturnValue("13.1-RELEASE");
    });

    it("returns generic label format for unknown platforms", () => {
      const result = resolveOsSummary();

      expect(result.platform).toBe("freebsd");
      expect(result.arch).toBe("x64");
      expect(result.label).toBe("freebsd 13.1-RELEASE (x64)");
    });
  });

  describe("safeTrim function", () => {
    it("handles string values correctly", () => {
      // This is tested indirectly through the main function
      // but we can verify the behavior by checking the output
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("linux");
      os.arch = vi.fn().mockReturnValue("x64");
      os.release = vi.fn().mockReturnValue("  5.15.0  ");

      const result = resolveOsSummary();
      expect(result.release).toBe("5.15.0");
      expect(result.label).toBe("linux 5.15.0 (x64)");
    });

    it("handles non-string values safely", () => {
      const os = require("node:os");
      os.platform = vi.fn().mockReturnValue("linux");
      os.arch = vi.fn().mockReturnValue("x64");
      os.release = vi.fn().mockReturnValue(null as any);

      const result = resolveOsSummary();
      expect(result.release).toBe("");
      expect(result.label).toBe("linux  (x64)");
    });
  });
});
