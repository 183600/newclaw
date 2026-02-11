import { describe, it, expect } from "vitest";
import { splitShellArgs } from "./shell-argv";

describe("splitShellArgs", () => {
  it("should handle empty input", () => {
    expect(splitShellArgs("")).toEqual([]);
    expect(splitShellArgs("   ")).toEqual([]);
  });

  it("should split simple arguments", () => {
    expect(splitShellArgs("arg1 arg2 arg3")).toEqual(["arg1", "arg2", "arg3"]);
    expect(splitShellArgs("single")).toEqual(["single"]);
  });

  it("should handle single quotes", () => {
    expect(splitShellArgs("'single quoted'")).toEqual(["single quoted"]);
    expect(splitShellArgs("arg1 'quoted arg' arg2")).toEqual(["arg1", "quoted arg", "arg2"]);
    expect(splitShellArgs("'it''s'")).toEqual(["its"]);
  });

  it("should handle double quotes", () => {
    expect(splitShellArgs('"double quoted"')).toEqual(["double quoted"]);
    expect(splitShellArgs('arg1 "quoted arg" arg2')).toEqual(["arg1", "quoted arg", "arg2"]);
    expect(splitShellArgs('"it"s"')).toBeNull(); // Unescaped quote inside quotes is invalid
  });

  it("should handle escaped characters", () => {
    expect(splitShellArgs("arg\\ 1")).toEqual(["arg 1"]);
    expect(splitShellArgs('arg\\"1')).toEqual(['arg"1']);
    expect(splitShellArgs("arg\\'1")).toEqual(["arg'1"]);
    expect(splitShellArgs("arg\\\\1")).toEqual(["arg\\1"]);
  });

  it("should handle mixed quotes and escaping", () => {
    expect(splitShellArgs("'single \"nested\" quotes'")).toEqual(['single "nested" quotes']);
    expect(splitShellArgs("\"double 'nested' quotes\"")).toEqual(["double 'nested' quotes"]);
    expect(splitShellArgs("'escaped \\' single'")).toBeNull(); // Unescaped quote inside quotes is invalid
    expect(splitShellArgs('"escaped \\" double"')).toBeNull(); // Unescaped quote inside quotes is invalid
  });

  it("should handle complex examples", () => {
    expect(splitShellArgs("command \"arg with spaces\" 'another arg'")).toEqual([
      "command",
      "arg with spaces",
      "another arg",
    ]);

    expect(splitShellArgs('git commit -m "commit message"')).toEqual([
      "git",
      "commit",
      "-m",
      "commit message",
    ]);
  });

  it("should return null for malformed quotes", () => {
    expect(splitShellArgs("unclosed 'quote")).toBeNull();
    expect(splitShellArgs('unclosed "quote')).toBeNull();
    expect(splitShellArgs("'mismatched\" quotes")).toBeNull();
    expect(splitShellArgs("\"mismatched' quotes")).toBeNull();
  });

  it("should return null for trailing escape", () => {
    expect(splitShellArgs("trailing\\")).toBeNull();
    expect(splitShellArgs("arg1\\ arg2\\")).toBeNull();
  });

  it("should handle multiple whitespace", () => {
    expect(splitShellArgs("arg1   arg2\targ3\narg4")).toEqual(["arg1", "arg2", "arg3", "arg4"]);
  });

  it("should preserve whitespace within quotes", () => {
    expect(splitShellArgs("'  spaced  '")).toEqual(["  spaced  "]);
    expect(splitShellArgs('"  spaced  "')).toEqual(["  spaced  "]);
  });

  it("should handle empty quoted strings", () => {
    expect(splitShellArgs("''")).toEqual([]);
    expect(splitShellArgs('""')).toEqual([]);
    expect(splitShellArgs("arg1 '' arg2")).toEqual(["arg1", "arg2"]);
  });

  it("should handle escaped whitespace in quotes", () => {
    expect(splitShellArgs("'escaped\\ space'")).toEqual(["escaped\\ space"]);
    expect(splitShellArgs('"escaped\\ space"')).toEqual(["escaped\\ space"]);
  });

  it("should handle real-world command examples", () => {
    expect(splitShellArgs('echo "Hello, World!"')).toEqual(["echo", "Hello, World!"]);
    expect(splitShellArgs("ls -la '/path with spaces/'")).toEqual([
      "ls",
      "-la",
      "/path with spaces/",
    ]);
    expect(splitShellArgs('grep "pattern" file.txt')).toEqual(["grep", "pattern", "file.txt"]);
  });
});
