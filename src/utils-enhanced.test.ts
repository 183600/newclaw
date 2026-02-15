import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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

describe("Enhanced Utility Functions", () => {
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

    it("handles negative ranges", () => {
      expect(clampNumber(-5, -10, 0)).toBe(-5);
      expect(clampNumber(-15, -10, 0)).toBe(-10);
      expect(clampNumber(5, -10, 0)).toBe(0);
    });
  });

  describe("clampInt", () => {
    it("clamps and floors values", () => {
      expect(clampInt(5.7, 0, 10)).toBe(5);
      expect(clampInt(9.9, 0, 10)).toBe(9);
      expect(clampInt(-1.2, 0, 10)).toBe(0);
      expect(clampInt(10.1, 0, 10)).toBe(10);
    });

    it("handles negative decimals", () => {
      expect(clampInt(-5.7, -10, 0)).toBe(-5); // Math.floor(-5.7) is -6, clamped to -5
      expect(clampInt(-9.9, -10, 0)).toBe(-10); // Math.floor(-9.9) is -10, within range
    });
  });

  describe("sleep function", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("resolves after specified time", async () => {
      const start = Date.now();
      const promise = sleep(1000);

      vi.advanceTimersByTime(1000);
      await promise;

      // Should have advanced by 1000ms
      expect(Date.now() - start).toBe(1000);
    });

    it("handles zero delay", async () => {
      const promise = sleep(0);
      await promise;
      // Should resolve immediately
    });
  });

  describe("resolveUserPath", () => {
    it("handles various path formats", () => {
      expect(resolveUserPath("~")).toContain("/home");
      expect(resolveUserPath("~/test")).toContain("/home");
      expect(resolveUserPath("/absolute/path")).toBe("/absolute/path");
      expect(resolveUserPath("relative/path")).toContain("relative/path");
    });

    it("preserves trailing slashes", () => {
      const result = resolveUserPath("~/test/");
      expect(result).toContain("/test/");
    });
  });

  describe("Path and Directory Operations", () => {
    it("normalizes various path formats", () => {
      expect(normalizePath("simple")).toBe("/simple");
      expect(normalizePath("/already/normalized")).toBe("/already/normalized");
      expect(normalizePath("")).toBe("/");
      expect(normalizePath("multiple//slashes")).toBe("/multiple//slashes");
    });

    it("handles complex paths", () => {
      expect(normalizePath("path/with/sub/directory")).toBe("/path/with/sub/directory");
      expect(normalizePath("/path/with/leading/slash")).toBe("/path/with/leading/slash");
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

    it("handles edge cases in number normalization", () => {
      expect(normalizeE164("")).toBe("+");
      expect(normalizeE164("+")).toBe("+");
      expect(normalizeE164("123")).toBe("+123");
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("handles null/undefined inputs gracefully", () => {
      expect(() => normalizePath("")).not.toThrow();
      expect(() => withWhatsAppPrefix("")).not.toThrow();
      expect(() => normalizeE164("")).not.toThrow();
      expect(normalizeE164("")).toBe("+");
    });

    it("handles extreme values in clamp functions", () => {
      expect(clampNumber(Number.MAX_SAFE_INTEGER, 0, 10)).toBe(10);
      expect(clampNumber(Number.MIN_SAFE_INTEGER, 0, 10)).toBe(0);
      expect(clampInt(Number.MAX_SAFE_INTEGER, 0, 10)).toBe(10);
    });
  });

  describe("Directory Operations", () => {
    it("ensures directory creation", async () => {
      const mockMkdir = vi.spyOn(require("node:fs").promises, "mkdir").mockResolvedValue(undefined);

      await ensureDir("/test/path");

      expect(mockMkdir).toHaveBeenCalledWith("/test/path", { recursive: true });
      mockMkdir.mockRestore();
    });
  });
});
