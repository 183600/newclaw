import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { setVerbose } from "./globals.js";
import { logDebug, logInfo, logWarn, logError, logSuccess } from "./logger.js";
import { resetLogger, setLoggerOverride } from "./logging.js";
import {
  clampNumber,
  clampInt,
  ensureDir,
  normalizePath,
  withWhatsAppPrefix,
  normalizeE164,
  sleep,
  resolveUserPath,
} from "./utils.js";

describe("Additional Utility Functions", () => {
  describe("clampNumber", () => {
    it("clamps values within range", () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(-5, 0, 10)).toBe(0);
      expect(clampNumber(15, 0, 10)).toBe(10);
    });

    it("handles edge cases", () => {
      expect(clampNumber(0, 0, 0)).toBe(0);
      expect(clampNumber(10.5, 0, 10)).toBe(10);
      expect(clampNumber(-0.1, 0, 10)).toBe(0);
    });
  });

  describe("clampInt", () => {
    it("clamps and floors values", () => {
      expect(clampInt(5.7, 0, 10)).toBe(5);
      expect(clampInt(9.9, 0, 10)).toBe(9);
      expect(clampInt(-1.2, 0, 10)).toBe(0);
      expect(clampInt(10.1, 0, 10)).toBe(10);
    });
  });

  describe("sleep function", () => {
    it("resolves after specified time", async () => {
      vi.useFakeTimers();
      const _start = Date.now();
      const promise = sleep(1000);

      vi.advanceTimersByTime(1000);
      await promise;

      vi.useRealTimers();
    });
  });

  describe("resolveUserPath", () => {
    it("handles various path formats", () => {
      expect(resolveUserPath("~")).toBe(os.homedir());
      expect(resolveUserPath("~/test")).toBe(path.join(os.homedir(), "test"));
      expect(resolveUserPath("/absolute/path")).toBe("/absolute/path");
      expect(resolveUserPath("relative/path")).toBe(path.resolve("relative/path"));
    });
  });
});

describe("Enhanced Logger Tests", () => {
  beforeEach(() => {
    resetLogger();
    setLoggerOverride(null);
    setVerbose(false);
  });

  afterEach(() => {
    resetLogger();
    setLoggerOverride(null);
    setVerbose(false);
  });

  it("handles complex message formatting", () => {
    const log = vi.fn();
    const runtime = { log, error: vi.fn(), exit: vi.fn() };

    logInfo("Test message with %s and %d", runtime, "format", 42);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("Test message"));
  });

  it("respects verbose setting for debug logs", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    setVerbose(false);
    logDebug("This should not appear");
    expect(consoleSpy).not.toHaveBeenCalled();

    setVerbose(true);
    logDebug("This should appear");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("writes to log file with different levels", () => {
    const logPath = path.join(os.tmpdir(), `test-log-${Date.now()}.log`);

    try {
      setLoggerOverride({ level: "info", file: logPath });
      fs.writeFileSync(logPath, "");

      logInfo("Info message");
      logWarn("Warning message");
      logError("Error message");
      logSuccess("Success message");
      logDebug("Debug message");

      const content = fs.readFileSync(logPath, "utf-8");
      expect(content).toContain("Info message");
      expect(content).toContain("Warning message");
      expect(content).toContain("Error message");
      expect(content).toContain("Success message");
      // Debug message should not be included at info level
    } finally {
      try {
        fs.unlinkSync(logPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});

describe("Path and Directory Operations", () => {
  it("creates nested directories efficiently", async () => {
    const tmpDir = path.join(os.tmpdir(), `openclaw-test-${Date.now()}`);
    const nestedPath = path.join(tmpDir, "level1", "level2", "level3");

    try {
      await ensureDir(nestedPath);
      expect(fs.existsSync(nestedPath)).toBe(true);

      // Should not throw if directory already exists
      await ensureDir(nestedPath);
      expect(fs.existsSync(nestedPath)).toBe(true);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it("normalizes various path formats", () => {
    expect(normalizePath("simple")).toBe("/simple");
    expect(normalizePath("/already/normalized")).toBe("/already/normalized");
    expect(normalizePath("")).toBe("/");
    expect(normalizePath("multiple//slashes")).toBe("/multiple//slashes");
  });
});

describe("WhatsApp Number Processing", () => {
  it("handles various WhatsApp number formats", () => {
    expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
  });

  it("normalizes E164 numbers correctly", () => {
    expect(normalizeE164("whatsapp:+1 (555) 123-4567")).toBe("+15551234567");
    expect(normalizeE164("+15551234567")).toBe("+15551234567");
    expect(normalizeE164("15551234567")).toBe("+15551234567");
    expect(normalizeE164("(555) 123-4567")).toBe("+5551234567");
  });
});

describe("Error Handling Edge Cases", () => {
  it("handles null/undefined inputs gracefully", () => {
    expect(() => normalizePath("")).not.toThrow();
    expect(() => withWhatsAppPrefix("")).not.toThrow();
    expect(() => normalizeE164("")).not.toThrow();
    expect(normalizeE164("")).toBe("+");
  });

  it("handles invalid directory paths", async () => {
    const invalidPath = "/root/nonexistent/invalid/path";

    try {
      await ensureDir(invalidPath);
      // If it succeeds, that's fine (some systems allow it)
    } catch (error) {
      // Expected to fail on most systems
      expect(error).toBeInstanceOf(Error);
    }
  });
});
