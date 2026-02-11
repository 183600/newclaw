import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  formatCliBannerLine,
  formatCliBannerArt,
  emitCliBanner,
  hasEmittedCliBanner,
} from "./banner.js";

// Mock the theme module
vi.mock("../terminal/theme.js", () => ({
  theme: {
    heading: vi.fn((text: string) => text),
    info: vi.fn((text: string) => text),
    muted: vi.fn((text: string) => text),
    accentDim: vi.fn((text: string) => `\u001b[38;2;255;90;45m${text}\u001b[0m`),
    accent: vi.fn((text: string) => `\u001b[38;2;255;90;45m${text}\u001b[0m`),
    accentBright: vi.fn((text: string) => text),
  },
  isRich: () => true,
}));

describe("formatCliBannerLine", () => {
  let bannerModule: any;

  beforeEach(async () => {
    vi.resetModules();
    bannerModule = await import("./banner.js");
  });

  it("should format banner line with all components", () => {
    const result = bannerModule.formatCliBannerLine("1.0.0", {
      commit: "abc123",
      columns: 120,
      richTty: false,
    });

    expect(result).toContain("🦞 OpenClaw");
    expect(result).toContain("1.0.0");
    expect(result).toContain("(abc123)");
    expect(result).toContain("—");
  });

  it("should split into two lines when content exceeds columns", () => {
    const result = bannerModule.formatCliBannerLine("1.0.0", {
      commit: "abc123",
      columns: 40, // Small width to force split
      richTty: false,
    });

    expect(result).toContain("\n");
    const lines = result.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("🦞 OpenClaw 1.0.0 (abc123)");
    expect(lines[1]).toMatch(/^\s+🦞/); // Indented second line with lobster
  });

  it("should handle null commit", () => {
    const result = bannerModule.formatCliBannerLine("1.0.0", {
      commit: null,
      richTty: false,
    });

    expect(result).toContain("(unknown)");
  });

  it("should use rich formatting when enabled", () => {
    const result = bannerModule.formatCliBannerLine("1.0.0", {
      commit: "abc123",
      richTty: true,
    });

    // Rich mode includes ANSI escape codes
    expect(result).toContain("\u001b[");
  });
});

describe("formatCliBannerArt", () => {
  let bannerModule: any;

  beforeEach(async () => {
    vi.resetModules();
    bannerModule = await import("./banner.js");
  });

  it("should return ASCII art without rich formatting", () => {
    const result = bannerModule.formatCliBannerArt({ richTty: false });

    expect(result).toContain("▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄");
    expect(result).toContain("🦞 OPENCLAW 🦞");
  });

  it("should include colored escape codes when rich formatting is enabled", () => {
    const result = bannerModule.formatCliBannerArt({ richTty: true });

    // Should contain ANSI color codes
    expect(result).toContain("\u001b[");
    expect(result).toContain("OPENCLAW");
  });
});

describe("emitCliBanner", () => {
  let originalWrite: typeof process.stdout.write;
  let mockWrite: ReturnType<typeof vi.fn>;
  let bannerModule: any;

  beforeEach(async () => {
    originalWrite = process.stdout.write;
    mockWrite = vi.fn();
    process.stdout.write = mockWrite;

    // Reset modules and re-import to get a fresh state
    vi.resetModules();
    bannerModule = await import("./banner.js");
  });

  afterEach(() => {
    process.stdout.write = originalWrite;
  });

  it("should emit banner when conditions are met", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw"] });

    expect(mockWrite).toHaveBeenCalled();
    expect(bannerModule.hasEmittedCliBanner()).toBe(true);

    process.stdout.isTTY = originalIsTTY;
  });

  it("should not emit banner when --json flag is present", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw", "--json"] });

    expect(mockWrite).not.toHaveBeenCalled();
    expect(bannerModule.hasEmittedCliBanner()).toBe(false);

    process.stdout.isTTY = originalIsTTY;
  });

  it("should not emit banner when --version flag is present", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw", "--version"] });

    expect(mockWrite).not.toHaveBeenCalled();
    expect(bannerModule.hasEmittedCliBanner()).toBe(false);

    process.stdout.isTTY = originalIsTTY;
  });

  it("should not emit banner when not in TTY", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = false;

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw"] });

    expect(mockWrite).not.toHaveBeenCalled();
    expect(bannerModule.hasEmittedCliBanner()).toBe(false);

    process.stdout.isTTY = originalIsTTY;
  });

  it("should not emit banner twice", () => {
    const originalIsTTY = process.stdout.isTTY;
    process.stdout.isTTY = true;

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw"] });
    expect(mockWrite).toHaveBeenCalledTimes(1);

    bannerModule.emitCliBanner("1.0.0", { argv: ["node", "openclaw"] });
    expect(mockWrite).toHaveBeenCalledTimes(1); // Still only called once

    process.stdout.isTTY = originalIsTTY;
  });
});
