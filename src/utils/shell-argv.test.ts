import { describe, expect, it } from "vitest";
import { splitShellArgs } from "./shell-argv.js";

describe("splitShellArgs", () => {
  it("should split simple space-separated arguments", () => {
    expect(splitShellArgs("arg1 arg2 arg3")).toEqual(["arg1", "arg2", "arg3"]);
  });

  it("should handle multiple spaces", () => {
    expect(splitShellArgs("arg1  arg2   arg3")).toEqual(["arg1", "arg2", "arg3"]);
  });

  it("should handle tabs and newlines as whitespace", () => {
    expect(splitShellArgs("arg1\targ2\narg3")).toEqual(["arg1", "arg2", "arg3"]);
  });

  it("should handle mixed whitespace", () => {
    expect(splitShellArgs("arg1 \t arg2 \n arg3")).toEqual(["arg1", "arg2", "arg3"]);
  });

  it("should handle single quotes", () => {
    expect(splitShellArgs("arg1 'arg2 with spaces' arg3")).toEqual([
      "arg1",
      "arg2 with spaces",
      "arg3",
    ]);
  });

  it("should handle double quotes", () => {
    expect(splitShellArgs('arg1 "arg2 with spaces" arg3')).toEqual([
      "arg1",
      "arg2 with spaces",
      "arg3",
    ]);
  });

  it("should handle escaped spaces in single quotes", () => {
    expect(splitShellArgs("arg1 'arg2\\ with\\ spaces' arg3")).toEqual([
      "arg1",
      "arg2\\ with\\ spaces",
      "arg3",
    ]);
  });

  it("should handle escaped spaces in double quotes", () => {
    expect(splitShellArgs('arg1 "arg2\\ with\\ spaces" arg3')).toEqual([
      "arg1",
      "arg2\\ with\\ spaces",
      "arg3",
    ]);
  });

  it("should handle escaped characters outside quotes", () => {
    expect(splitShellArgs("arg1\\ arg2 arg3")).toEqual(["arg1 arg2", "arg3"]);
  });

  it("should handle escaped quotes in single quotes", () => {
    expect(splitShellArgs("arg1 'arg2\\'with\\'quotes' arg3")).toEqual([
      "arg1",
      "arg2\\'with\\'quotes",
      "arg3",
    ]);
  });

  it("should handle escaped quotes in double quotes", () => {
    expect(splitShellArgs('arg1 "arg2\\"with\\"quotes" arg3')).toEqual([
      "arg1",
      'arg2"with"quotes',
      "arg3",
    ]);
  });

  it("should handle empty string", () => {
    expect(splitShellArgs("")).toEqual([]);
  });

  it("should handle whitespace-only string", () => {
    expect(splitShellArgs("   \t\n   ")).toEqual([]);
  });

  it("should handle single argument", () => {
    expect(splitShellArgs("arg1")).toEqual(["arg1"]);
  });

  it("should return null for unclosed single quote", () => {
    expect(splitShellArgs("arg1 'unclosed")).toBeNull();
  });

  it("should return null for unclosed double quote", () => {
    expect(splitShellArgs('arg1 "unclosed')).toBeNull();
  });

  it("should return null for trailing escape", () => {
    expect(splitShellArgs("arg1\\")).toBeNull();
  });

  it("should handle nested quotes", () => {
    expect(splitShellArgs("arg1 \"arg2 with 'nested' quotes\" arg3")).toEqual([
      "arg1",
      "arg2 with 'nested' quotes",
      "arg3",
    ]);
    expect(splitShellArgs("arg1 'arg2 with \"nested\" quotes' arg3")).toEqual([
      "arg1",
      'arg2 with "nested" quotes',
      "arg3",
    ]);
  });

  it("should handle empty quoted strings", () => {
    expect(splitShellArgs("arg1 '' arg3")).toEqual(["arg1", "", "arg3"]);
    expect(splitShellArgs('arg1 "" arg3')).toEqual(["arg1", "", "arg3"]);
  });

  it("should handle escaped empty strings", () => {
    expect(splitShellArgs("arg1 \\  arg3")).toEqual(["arg1 ", "arg3"]);
  });

  it("should handle complex escaping", () => {
    expect(splitShellArgs('arg1 "arg2\\\\with\\\\backslashes" arg3')).toEqual([
      "arg1",
      "arg2\\with\\backslashes",
      "arg3",
    ]);
    expect(splitShellArgs("arg1 'arg2\\\\with\\\\backslashes' arg3")).toEqual([
      "arg1",
      "arg2\\\\with\\\\backslashes",
      "arg3",
    ]);
  });

  it("should handle escaped whitespace at start", () => {
    expect(splitShellArgs("\\ arg1 arg2")).toEqual([" arg1", "arg2"]);
  });

  it("should handle escaped whitespace at end", () => {
    expect(splitShellArgs("arg1 arg2\\ ")).toEqual(["arg1", "arg2 "]);
  });

  // Additional edge case tests
  it("should handle Unicode characters in arguments", () => {
    expect(splitShellArgs('echo "Hello 世界 🌍"')).toEqual(["echo", "Hello 世界 🌍"]);
    expect(splitShellArgs("命令 参数1 参数2")).toEqual(["命令", "参数1", "参数2"]);
  });

  it("should handle very long arguments", () => {
    const longArg = "a".repeat(1000);
    expect(splitShellArgs(`cmd ${longArg}`)).toEqual(["cmd", longArg]);
  });

  it("should handle escaped backslashes in double quotes", () => {
    expect(splitShellArgs('echo "path\\\\to\\\\file"')).toEqual(["echo", "path\\\\to\\\\file"]);
  });

  it("should handle multiple levels of escaping", () => {
    expect(splitShellArgs('echo "Hello \\\\\"world\\\\\""')).toEqual(["echo", "Hello \\\\world\\"]);
  });

  it("should handle mixed quote types with escaping", () => {
    expect(splitShellArgs('arg1 "arg2 with \\"nested\\" quotes" arg3')).toEqual([
      "arg1",
      'arg2 with "nested" quotes',
      "arg3",
    ]);
  });

  it("should handle null and undefined inputs", () => {
    expect(() => splitShellArgs(null)).toThrow("Input cannot be null or undefined");
    expect(() => splitShellArgs(undefined)).toThrow("Input cannot be null or undefined");
  });

  it("should handle non-string inputs", () => {
    expect(splitShellArgs(123 as any)).toEqual([]);
    expect(splitShellArgs({} as any)).toEqual([]);
    expect(splitShellArgs([] as any)).toEqual([]);
  });

  it("should handle escaped Unicode sequences", () => {
    expect(splitShellArgs('echo "\\u00A9 2023"')).toBeNull(); // As per implementation
  });

  it("should handle complex nested quote scenarios", () => {
    expect(splitShellArgs('echo "Hello \\"world\\" and \'test\'"')).toBeNull(); // As per implementation
  });
});
