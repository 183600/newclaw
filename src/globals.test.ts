import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isVerbose,
  isYes,
  logVerbose,
  logVerboseConsole,
  setVerbose,
  setYes,
  shouldLogVerbose,
  success,
  warn,
  info,
  danger,
} from "./globals.js";

// Mock console to avoid actual output during tests
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("globals", () => {
  afterEach(() => {
    setVerbose(false);
    setYes(false);
    consoleSpy.mockClear();
  });

  describe("verbose functionality", () => {
    it("toggles verbose flag and logs when enabled", () => {
      setVerbose(false);
      logVerbose("hidden");
      expect(consoleSpy).not.toHaveBeenCalled();

      setVerbose(true);
      logVerbose("shown");
      expect(isVerbose()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("shown"));
    });

    it("defaults to verbose disabled", () => {
      expect(isVerbose()).toBe(false);
    });

    it("handles multiple verbose state changes", () => {
      setVerbose(true);
      expect(isVerbose()).toBe(true);

      setVerbose(false);
      expect(isVerbose()).toBe(false);

      setVerbose(true);
      expect(isVerbose()).toBe(true);

      setVerbose(false);
      expect(isVerbose()).toBe(false);
    });

    it("handles empty and undefined log messages", () => {
      setVerbose(true);

      logVerbose("");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(""));

      logVerbose(undefined as any);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("undefined"));

      logVerbose(null as any);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("null"));
    });
  });

  describe("logVerboseConsole function", () => {
    it("logs to console only when verbose is enabled", () => {
      setVerbose(false);
      logVerboseConsole("hidden");
      expect(consoleSpy).not.toHaveBeenCalled();

      setVerbose(true);
      logVerboseConsole("visible");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("visible"));
    });
  });

  describe("shouldLogVerbose function", () => {
    it("returns true when verbose is enabled", () => {
      setVerbose(true);
      expect(shouldLogVerbose()).toBe(true);
    });

    it("returns false when verbose is disabled", () => {
      setVerbose(false);
      expect(shouldLogVerbose()).toBe(false);
    });
  });

  describe("yes flag functionality", () => {
    it("stores yes flag", () => {
      setYes(true);
      expect(isYes()).toBe(true);
      setYes(false);
      expect(isYes()).toBe(false);
    });

    it("defaults to yes disabled", () => {
      expect(isYes()).toBe(false);
    });

    it("handles multiple yes state changes", () => {
      setYes(true);
      expect(isYes()).toBe(true);

      setYes(false);
      expect(isYes()).toBe(false);

      setYes(true);
      expect(isYes()).toBe(true);
    });
  });

  describe("theme color exports", () => {
    it("exports theme color functions", () => {
      // Test that the functions are exported and callable
      expect(typeof success).toBe("function");
      expect(typeof warn).toBe("function");
      expect(typeof info).toBe("function");
      expect(typeof danger).toBe("function");

      // Test that they return strings (actual theme formatting may vary)
      expect(typeof success("test")).toBe("string");
      expect(typeof warn("test")).toBe("string");
      expect(typeof info("test")).toBe("string");
      expect(typeof danger("test")).toBe("string");
    });
  });

  describe("integration tests", () => {
    it("works with verbose and yes flags together", () => {
      setVerbose(true);
      setYes(true);

      expect(isVerbose()).toBe(true);
      expect(isYes()).toBe(true);

      setVerbose(false);
      setYes(false);

      expect(isVerbose()).toBe(false);
      expect(isYes()).toBe(false);
    });

    it("handles concurrent function calls", () => {
      setVerbose(true);

      logVerbose("message 1");
      logVerboseConsole("message 2");
      logVerbose("message 3");

      expect(consoleSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("edge cases", () => {
    it("handles rapid state changes", () => {
      for (let i = 0; i < 10; i++) {
        setVerbose(i % 2 === 0);
        expect(isVerbose()).toBe(i % 2 === 0);
      }
    });

    it("handles boolean conversion for setVerbose", () => {
      setVerbose(true as any);
      expect(isVerbose()).toBe(true);

      setVerbose(false as any);
      expect(isVerbose()).toBe(false);

      setVerbose(Boolean(1) as any);
      expect(isVerbose()).toBe(true);

      setVerbose(Boolean(0) as any);
      expect(isVerbose()).toBe(false);
    });

    it("handles boolean conversion for setYes", () => {
      setYes(true as any);
      expect(isYes()).toBe(true);

      setYes(false as any);
      expect(isYes()).toBe(false);

      setYes(Boolean(1) as any);
      expect(isYes()).toBe(true);

      setYes(Boolean(0) as any);
      expect(isYes()).toBe(false);
    });
  });
});
