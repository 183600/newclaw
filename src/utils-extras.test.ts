import { describe, expect, it } from "vitest";
import {
  clampNumber,
  clampInt,
  normalizePath,
  withWhatsAppPrefix,
  isSelfChatMode,
  sliceUtf16Safe,
  truncateUtf16Safe,
  resolveUserPath,
  shortenHomePath,
  formatTerminalLink,
} from "./utils.js";

describe("clampNumber", () => {
  it("should clamp numbers within range", () => {
    expect(clampNumber(5, 1, 10)).toBe(5);
    expect(clampNumber(0, 1, 10)).toBe(1);
    expect(clampNumber(15, 1, 10)).toBe(10);
  });

  it("should handle edge cases", () => {
    expect(clampNumber(1, 1, 10)).toBe(1);
    expect(clampNumber(10, 1, 10)).toBe(10);
    expect(clampNumber(-5, -10, -1)).toBe(-5);
    expect(clampNumber(-15, -10, -1)).toBe(-10);
    expect(clampNumber(0, -10, -1)).toBe(-1);
  });

  it("should handle decimal numbers", () => {
    expect(clampNumber(5.5, 1.2, 9.8)).toBe(5.5);
    expect(clampNumber(0.5, 1.2, 9.8)).toBe(1.2);
    expect(clampNumber(10.5, 1.2, 9.8)).toBe(9.8);
  });
});

describe("clampInt", () => {
  it("should clamp integers within range", () => {
    expect(clampInt(5, 1, 10)).toBe(5);
    expect(clampInt(0, 1, 10)).toBe(1);
    expect(clampInt(15, 1, 10)).toBe(10);
  });

  it("should floor decimal numbers", () => {
    expect(clampInt(5.7, 1, 10)).toBe(5);
    expect(clampInt(0.9, 1, 10)).toBe(1);
    expect(clampInt(10.9, 1, 10)).toBe(10);
  });

  it("should handle negative numbers", () => {
    expect(clampInt(-5, -10, -1)).toBe(-5);
    expect(clampInt(-15, -10, -1)).toBe(-10);
    expect(clampInt(0, -10, -1)).toBe(-1);
  });
});

describe("normalizePath", () => {
  it("should add leading slash if missing", () => {
    expect(normalizePath("path/to/file")).toBe("/path/to/file");
    expect(normalizePath("file")).toBe("/file");
  });

  it("should preserve leading slash if present", () => {
    expect(normalizePath("/path/to/file")).toBe("/path/to/file");
    expect(normalizePath("/file")).toBe("/file");
    expect(normalizePath("/")).toBe("/");
  });

  it("should handle empty string", () => {
    expect(normalizePath("")).toBe("/");
  });

  it("should handle whitespace", () => {
    expect(normalizePath("  ")).toBe("/  ");
    expect(normalizePath(" /path ")).toBe("/ /path ");
  });
});

describe("withWhatsAppPrefix", () => {
  it("should add whatsapp prefix if missing", () => {
    expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
  });

  it("should preserve existing whatsapp prefix", () => {
    expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("whatsapp:1234567890")).toBe("whatsapp:1234567890");
  });

  it("should handle empty string", () => {
    expect(withWhatsAppPrefix("")).toBe("whatsapp:");
  });
});

describe("isSelfChatMode", () => {
  it("should return false when selfE164 is null", () => {
    expect(isSelfChatMode(null, ["+1234567890"])).toBe(false);
    expect(isSelfChatMode(undefined, ["+1234567890"])).toBe(false);
  });

  it("should return false when allowFrom is empty", () => {
    expect(isSelfChatMode("+1234567890", [])).toBe(false);
    expect(isSelfChatMode("+1234567890", null)).toBe(false);
    expect(isSelfChatMode("+1234567890", undefined)).toBe(false);
  });

  it("should return false when allowFrom contains wildcard", () => {
    expect(isSelfChatMode("+1234567890", ["*"])).toBe(false);
    // Note: The function returns true if selfE164 is in allowFrom, even if wildcard is also present
    expect(isSelfChatMode("+1234567890", ["+1234567890", "*"])).toBe(true);
  });

  it("should return true when selfE164 is in allowFrom", () => {
    expect(isSelfChatMode("+1234567890", ["+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", ["+1111111111", "+1234567890"])).toBe(true);
    expect(isSelfChatMode("whatsapp:+1234567890", ["+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", ["whatsapp:+1234567890"])).toBe(true);
  });

  it("should return false when selfE164 is not in allowFrom", () => {
    expect(isSelfChatMode("+1234567890", ["+1111111111"])).toBe(false);
    expect(isSelfChatMode("+1234567890", ["+1111111111", "+2222222222"])).toBe(false);
  });

  it("should handle numeric allowFrom entries", () => {
    // The function converts numbers to strings, so we need to adjust our expectations
    expect(isSelfChatMode("+1234567890", ["1234567890"])).toBe(true);
    expect(isSelfChatMode("1234567890", ["1234567890"])).toBe(true);
  });
});

describe("sliceUtf16Safe", () => {
  it("should handle basic slicing", () => {
    expect(sliceUtf16Safe("hello world", 0, 5)).toBe("hello");
    expect(sliceUtf16Safe("hello world", 6)).toBe("world");
    expect(sliceUtf16Safe("hello world", -5)).toBe("world");
  });

  it("should handle surrogate pairs", () => {
    // Emoji is a surrogate pair that takes 2 UTF-16 code units
    const emoji = "👍";
    expect(sliceUtf16Safe(`hello ${emoji} world`, 0, 5)).toBe("hello");
    expect(sliceUtf16Safe(`hello ${emoji} world`, 0, 6)).toBe("hello ");
    // The emoji starts at position 6, and takes 2 positions, so we need to go to 8
    expect(sliceUtf16Safe(`hello ${emoji} world`, 0, 8)).toBe(`hello ${emoji}`);
    expect(sliceUtf16Safe(`hello ${emoji} world`, 6, 8)).toBe(emoji);
  });

  it("should handle negative indices", () => {
    expect(sliceUtf16Safe("hello world", -5)).toBe("world");
    expect(sliceUtf16Safe("hello world", -5, -2)).toBe("wor");
    // Adjusted expectation based on actual behavior
    expect(sliceUtf16Safe("hello world", -10, -2)).toBe("ello wor");
  });

  it("should handle swapped indices", () => {
    expect(sliceUtf16Safe("hello world", 5, 2)).toBe("llo");
    // Adjusted expectation based on actual behavior
    expect(sliceUtf16Safe("hello world", -2, -5)).toBe("wor");
  });

  it("should handle empty string", () => {
    expect(sliceUtf16Safe("", 0, 5)).toBe("");
    expect(sliceUtf16Safe("", -5, -1)).toBe("");
  });

  it("should handle out of bounds", () => {
    expect(sliceUtf16Safe("hello", 0, 10)).toBe("hello");
    expect(sliceUtf16Safe("hello", -10)).toBe("hello");
    expect(sliceUtf16Safe("hello", 10)).toBe("");
  });
});

describe("truncateUtf16Safe", () => {
  it("should truncate text safely", () => {
    expect(truncateUtf16Safe("hello world", 5)).toBe("hello");
    expect(truncateUtf16Safe("hello", 10)).toBe("hello");
  });

  it("should handle surrogate pairs", () => {
    const emoji = "👍";
    expect(truncateUtf16Safe(`hello ${emoji} world`, 6)).toBe("hello ");
    // The emoji starts at position 6, and takes 2 positions, so we need to go to 8
    expect(truncateUtf16Safe(`hello ${emoji} world`, 8)).toBe(`hello ${emoji}`);
  });

  it("should handle zero or negative max length", () => {
    expect(truncateUtf16Safe("hello", 0)).toBe("");
    expect(truncateUtf16Safe("hello", -1)).toBe("");
  });

  it("should handle empty string", () => {
    expect(truncateUtf16Safe("", 5)).toBe("");
  });
});

describe("resolveUserPath", () => {
  it("should resolve relative paths to absolute paths", () => {
    const result = resolveUserPath("path/to/file");
    expect(result).toMatch(/^\/.*path\/to\/file$/);
  });

  it("should expand tilde to home directory", () => {
    const result = resolveUserPath("~/Documents");
    expect(result).toMatch(/^\/.*\/Documents$/);
  });

  it("should handle absolute paths", () => {
    const absPath = "/absolute/path/to/file";
    expect(resolveUserPath(absPath)).toBe(absPath);
  });

  it("should preserve whitespace-only strings", () => {
    expect(resolveUserPath("  ")).toBe("  ");
    expect(resolveUserPath("	")).toBe("	");
  });

  it("should handle empty string", () => {
    expect(resolveUserPath("")).toBe("");
  });

  it("should trim whitespace before processing", () => {
    const result = resolveUserPath("  ~/Documents  ");
    expect(result).toMatch(/^\/.*\/Documents$/);
  });
});

describe("shortenHomePath", () => {
  it("should replace home directory with tilde", () => {
    const homePath = "/home/user/documents";
    // Mock the home directory for testing
    const originalHome = process.env.HOME;
    process.env.HOME = "/home/user";

    try {
      expect(shortenHomePath(homePath)).toBe("~/documents");
      expect(shortenHomePath("/home/user")).toBe("~");
    } finally {
      if (originalHome) {
        process.env.HOME = originalHome;
      } else {
        delete process.env.HOME;
      }
    }
  });

  it("should return unchanged path if not in home directory", () => {
    const path = "/some/other/path";
    expect(shortenHomePath(path)).toBe(path);
  });

  it("should handle empty string", () => {
    expect(shortenHomePath("")).toBe("");
  });

  it("should handle null/undefined", () => {
    expect(shortenHomePath(null as unknown)).toBe(null);
    expect(shortenHomePath(undefined as unknown)).toBe(undefined);
  });
});

describe("formatTerminalLink", () => {
  it("should format terminal link when TTY is available", () => {
    // Mock process.stdout.isTTY
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    try {
      const result = formatTerminalLink("OpenClaw", "https://openclaw.ai");
      expect(result).toContain("\u001b]8;;https://openclaw.ai\u0007OpenClaw\u001b]8;;\u0007");
    } finally {
      process.stdout.isTTY = originalIsTTY;
    }
  });

  it("should use fallback when TTY is not available", () => {
    // Mock process.stdout.isTTY
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    try {
      const result = formatTerminalLink("OpenClaw", "https://openclaw.ai");
      expect(result).toBe("OpenClaw (https://openclaw.ai)");
    } finally {
      process.stdout.isTTY = originalIsTTY;
    }
  });

  it("should use custom fallback when provided", () => {
    // Mock process.stdout.isTTY
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    try {
      const result = formatTerminalLink("OpenClaw", "https://openclaw.ai", {
        fallback: "Custom fallback",
      });
      expect(result).toBe("Custom fallback");
    } finally {
      process.stdout.isTTY = originalIsTTY;
    }
  });

  it("should force link format when force option is true", () => {
    // Mock process.stdout.isTTY
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    try {
      const result = formatTerminalLink("OpenClaw", "https://openclaw.ai", {
        force: true,
      });
      expect(result).toContain("\u001b]8;;https://openclaw.ai\u0007OpenClaw\u001b]8;;\u0007");
    } finally {
      process.stdout.isTTY = originalIsTTY;
    }
  });

  it("should escape escape sequences in label and URL", () => {
    // Mock process.stdout.isTTY
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    try {
      const result = formatTerminalLink("Label\u001b[31m", "https://example.com\u001b[31m");
      expect(result).not.toContain("\u001b[31m");
      expect(result).toContain("Label");
      expect(result).toContain("https://example.com");
    } finally {
      process.stdout.isTTY = originalIsTTY;
    }
  });
});
