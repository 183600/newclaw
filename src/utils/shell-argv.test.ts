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
});
