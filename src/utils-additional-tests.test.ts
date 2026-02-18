import { describe, expect, it } from "vitest";
import {
  clampNumber,
  clampInt,
  normalizePath,
  withWhatsAppPrefix,
  normalizeE164,
  toWhatsappJid,
  isSelfChatMode,
  sleep,
  sliceUtf16Safe,
  truncateUtf16Safe,
  resolveUserPath,
  shortenHomePath,
  shortenHomeInString,
  formatTerminalLink,
} from "./utils.js";

describe("Additional Utils Tests", () => {
  describe("clampNumber", () => {
    it("should clamp values within range", () => {
      expect(clampNumber(5, 1, 10)).toBe(5);
      expect(clampNumber(0, 1, 10)).toBe(1);
      expect(clampNumber(15, 1, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      expect(clampNumber(-5, -10, -1)).toBe(-5);
      expect(clampNumber(-15, -10, -1)).toBe(-10);
      expect(clampNumber(0, -10, -1)).toBe(-1);
    });

    it("should handle decimal values", () => {
      expect(clampNumber(5.5, 1, 10)).toBe(5.5);
      expect(clampNumber(0.9, 1, 10)).toBe(1);
      expect(clampNumber(10.1, 1, 10)).toBe(10);
    });
  });

  describe("clampInt", () => {
    it("should clamp and floor values", () => {
      expect(clampInt(5.7, 1, 10)).toBe(5);
      expect(clampInt(0.9, 1, 10)).toBe(1);
      expect(clampInt(10.9, 1, 10)).toBe(10);
    });

    it("should handle negative values", () => {
      expect(clampInt(-5.7, -10, -1)).toBe(-6);
      expect(clampInt(-15.7, -10, -1)).toBe(-10);
      expect(clampInt(-0.9, -10, -1)).toBe(-1);
    });
  });

  describe("normalizePath", () => {
    it("should add leading slash to relative paths", () => {
      expect(normalizePath("path/to/file")).toBe("/path/to/file");
      expect(normalizePath("file")).toBe("/file");
    });

    it("should preserve existing leading slash", () => {
      expect(normalizePath("/path/to/file")).toBe("/path/to/file");
      expect(normalizePath("/")).toBe("/");
    });

    it("should handle empty string", () => {
      expect(normalizePath("")).toBe("/");
    });
  });

  describe("withWhatsAppPrefix", () => {
    it("should add whatsapp prefix to phone numbers", () => {
      expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
    });

    it("should preserve existing whatsapp prefix", () => {
      expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("whatsapp:1234567890")).toBe("whatsapp:1234567890");
    });
  });

  describe("normalizeE164", () => {
    it("should normalize phone numbers to E164 format", () => {
      expect(normalizeE164("whatsapp:+1 (555) 123-4567")).toBe("+15551234567");
      expect(normalizeE164("(555) 123-4567")).toBe("+5551234567");
      expect(normalizeE164("555-123-4567")).toBe("+5551234567");
    });

    it("should handle international numbers", () => {
      expect(normalizeE164("+44 20 7946 0958")).toBe("+442079460958");
      expect(normalizeE164("whatsapp:+44 20 7946 0958")).toBe("+442079460958");
    });

    it("should handle empty input", () => {
      expect(normalizeE164("")).toBe("+");
    });
  });

  describe("toWhatsappJid", () => {
    it("should convert phone numbers to JID format", () => {
      expect(toWhatsappJid("whatsapp:+15551234567")).toBe("15551234567@s.whatsapp.net");
      expect(toWhatsappJid("+15551234567")).toBe("15551234567@s.whatsapp.net");
    });

    it("should preserve existing JIDs", () => {
      expect(toWhatsappJid("15551234567@s.whatsapp.net")).toBe("15551234567@s.whatsapp.net");
      expect(toWhatsappJid("123456789-987654321@g.us")).toBe("123456789-987654321@g.us");
    });
  });

  describe("isSelfChatMode", () => {
    it("should detect self-chat mode", () => {
      expect(isSelfChatMode("+15551234567", ["+15551234567"])).toBe(true);
      expect(isSelfChatMode("whatsapp:+15551234567", ["whatsapp:+15551234567"])).toBe(true);
    });

    it("should not detect self-chat mode for different numbers", () => {
      expect(isSelfChatMode("+15551234567", ["+15551234568"])).toBe(false);
      expect(isSelfChatMode("+15551234567", [])).toBe(false);
    });

    it("should handle wildcard allowFrom", () => {
      expect(isSelfChatMode("+15551234567", ["*"])).toBe(false);
    });

    it("should handle null/undefined selfE164", () => {
      expect(isSelfChatMode(null, ["+15551234567"])).toBe(false);
      expect(isSelfChatMode(undefined, ["+15551234567"])).toBe(false);
    });
  });

  describe("sleep", () => {
    it("should resolve after the specified time", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });

  describe("sliceUtf16Safe", () => {
    it("should handle basic slicing", () => {
      expect(sliceUtf16Safe("hello world", 0, 5)).toBe("hello");
      expect(sliceUtf16Safe("hello world", 6)).toBe("world");
    });

    it("should handle surrogate pairs", () => {
      const emoji = "hello 🌍 world";
      // 🌍 takes 2 code units in UTF-16, so we need to slice carefully
      expect(sliceUtf16Safe(emoji, 0, 8)).toBe("hello 🌍");
      expect(sliceUtf16Safe(emoji, 9)).toBe("world");
    });

    it("should handle negative indices", () => {
      expect(sliceUtf16Safe("hello world", -5)).toBe("world");
      expect(sliceUtf16Safe("hello world", -5, -1)).toBe("worl");
    });

    it("should handle empty string", () => {
      expect(sliceUtf16Safe("", 0, 5)).toBe("");
    });
  });

  describe("truncateUtf16Safe", () => {
    it("should truncate text safely", () => {
      expect(truncateUtf16Safe("hello world", 5)).toBe("hello");
      expect(truncateUtf16Safe("hello world", 50)).toBe("hello world");
    });

    it("should handle surrogate pairs", () => {
      const emoji = "hello 🌍 world";
      // 🌍 takes 2 code units in UTF-16, so we need to truncate carefully
      expect(truncateUtf16Safe(emoji, 8)).toBe("hello 🌍");
      expect(truncateUtf16Safe(emoji, 9)).toBe("hello 🌍 ");
    });

    it("should handle zero length", () => {
      expect(truncateUtf16Safe("hello world", 0)).toBe("");
    });
  });

  describe("resolveUserPath", () => {
    it("should expand ~ to home directory", () => {
      const result = resolveUserPath("~/test");
      expect(result).toMatch(/\/test$/);
      expect(result).not.toMatch(/^~/);
    });

    it("should resolve relative paths", () => {
      const result = resolveUserPath("test/path");
      expect(result).toMatch(/\/test\/path$/);
      expect(result).not.toMatch(/^test\/path$/);
    });

    it("should handle absolute paths", () => {
      const result = resolveUserPath("/absolute/path");
      expect(result).toBe("/absolute/path");
    });

    it("should preserve whitespace-only strings", () => {
      expect(resolveUserPath("   ")).toBe("   ");
      expect(resolveUserPath("\t")).toBe("\t");
    });
  });

  describe("shortenHomePath", () => {
    it("should replace home directory with ~", () => {
      const homeDir = require("os").homedir();
      expect(shortenHomePath(`${homeDir}/test`)).toBe("~/test");
      expect(shortenHomePath(homeDir)).toBe("~");
    });

    it("should not modify non-home paths", () => {
      expect(shortenHomePath("/other/path")).toBe("/other/path");
      expect(shortenHomePath("relative/path")).toBe("relative/path");
    });

    it("should handle empty input", () => {
      expect(shortenHomePath("")).toBe("");
    });
  });

  describe("shortenHomeInString", () => {
    it("should replace home directory occurrences in strings", () => {
      const homeDir = require("os").homedir();
      const input = `Path 1: ${homeDir}/test, Path 2: ${homeDir}/docs`;
      expect(shortenHomeInString(input)).toBe("Path 1: ~/test, Path 2: ~/docs");
    });

    it("should handle empty input", () => {
      expect(shortenHomeInString("")).toBe("");
    });
  });

  describe("formatTerminalLink", () => {
    it("should format terminal links when TTY is available", () => {
      const result = formatTerminalLink("Test Link", "https://example.com", { force: true });
      const expected = "\u001b]8;;https://example.com\u0007Test Link\u001b]8;;\u0007";
      expect(result).toBe(expected);
    });

    it("should use fallback when TTY is not available", () => {
      const result = formatTerminalLink("Test Link", "https://example.com", {
        force: false,
        fallback: "Test Link (https://example.com)",
      });
      expect(result).toBe("Test Link (https://example.com)");
    });

    it("should use default fallback when none provided", () => {
      const result = formatTerminalLink("Test Link", "https://example.com", { force: false });
      expect(result).toBe("Test Link (https://example.com)");
    });

    it("should escape ANSI escape sequences in label and URL", () => {
      const result = formatTerminalLink("Test\u001b[31mLink", "https://example\u001b[31m.com", {
        force: true,
      });
      expect(result).not.toContain("\u001b[31m");
    });
  });
});
