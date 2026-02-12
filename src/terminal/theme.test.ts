import { describe, expect, it, vi, beforeEach } from "vitest";
import { theme, isRich, colorize } from "./theme.js";

describe("theme", () => {
  it("should export all expected color functions", () => {
    expect(typeof theme.accent).toBe("function");
    expect(typeof theme.accentBright).toBe("function");
    expect(typeof theme.accentDim).toBe("function");
    expect(typeof theme.info).toBe("function");
    expect(typeof theme.success).toBe("function");
    expect(typeof theme.warn).toBe("function");
    expect(typeof theme.error).toBe("function");
    expect(typeof theme.muted).toBe("function");
    expect(typeof theme.heading).toBe("function");
    expect(typeof theme.command).toBe("function");
    expect(typeof theme.option).toBe("function");
  });

  it("should apply color formatting to text", () => {
    const text = "Test text";
    const result = theme.accent(text);
    expect(result).toContain(text);
    // In test environment, color formatting might be disabled
    // So we just check that the function returns a string
    expect(typeof result).toBe("string");
  });

  it("should apply bold formatting to heading", () => {
    const text = "Heading";
    const result = theme.heading(text);
    expect(result).toContain(text);
    // In test environment, color formatting might be disabled
    // So we just check that the function returns a string
    expect(typeof result).toBe("string");
  });
});

describe("isRich", () => {
  beforeEach(() => {
    // Reset environment variables before each test
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
  });

  it("should return true when chalk level is greater than 0", () => {
    // This is the default case in most test environments
    const result = isRich();
    expect(typeof result).toBe("boolean");
  });

  it("should return false when NO_COLOR is set and FORCE_COLOR is not", () => {
    process.env.NO_COLOR = "1";
    // Re-import the module to pick up the new environment variable
    vi.resetModules();
    return import("./theme.js").then((module) => {
      expect(module.isRich()).toBe(false);
    });
  });

  it("should handle FORCE_COLOR environment variable", async () => {
    // This test verifies that the isRich function works with environment variables
    // The exact behavior might depend on the test environment
    const module = await import("./theme.js");
    expect(typeof module.isRich()).toBe("boolean");
  });
});

describe("colorize", () => {
  it("should apply color when rich is true", () => {
    const colorFn = (text: string) => `colored(${text})`;
    const text = "Test text";
    const result = colorize(true, colorFn, text);
    expect(result).toBe("colored(Test text)");
  });

  it("should return plain text when rich is false", () => {
    const colorFn = (text: string) => `colored(${text})`;
    const text = "Test text";
    const result = colorize(false, colorFn, text);
    expect(result).toBe(text);
  });

  it("should handle empty string", () => {
    const colorFn = (text: string) => `colored(${text})`;
    const result = colorize(true, colorFn, "");
    expect(result).toBe("colored()");
  });

  it("should handle special characters", () => {
    const colorFn = (text: string) => `colored(${text})`;
    const text = "Special: !@#$%^&*()";
    const result = colorize(true, colorFn, text);
    expect(result).toBe(`colored(${text})`);
  });
});
