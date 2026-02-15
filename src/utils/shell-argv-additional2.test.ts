import { describe, expect, it } from "vitest";
import { splitShellArgs } from "./shell-argv.js";

describe("splitShellArgs - Additional Tests", () => {
  it("should handle multiple escaped spaces", () => {
    expect(splitShellArgs("cmd arg1\\ \\ arg2")).toEqual(["cmd", "arg1  arg2"]);
  });

  it("should handle empty arguments with quotes", () => {
    expect(splitShellArgs('cmd "" ""')).toEqual(["cmd", "", ""]);
    expect(splitShellArgs("cmd '' ''")).toEqual(["cmd", "", ""]);
  });

  it("should handle Unicode characters in quotes", () => {
    expect(splitShellArgs('cmd "Hello 世界 🌍"')).toEqual(["cmd", "Hello 世界 🌍"]);
    expect(splitShellArgs("cmd 'Hello 世界 🌍'")).toEqual(["cmd", "Hello 世界 🌍"]);
  });

  it("should handle special characters", () => {
    expect(splitShellArgs('cmd "arg1@#$%^&*()"')).toEqual(["cmd", "arg1@#$%^&*()"]);
    expect(splitShellArgs("cmd 'arg1@#$%^&*()'")).toEqual(["cmd", "arg1@#$%^&*()"]);
  });

  it("should handle very long arguments", () => {
    const longArg = "a".repeat(1000);
    expect(splitShellArgs(`cmd ${longArg}`)).toEqual(["cmd", longArg]);
  });

  it("should handle arguments with newlines", () => {
    expect(splitShellArgs('cmd "arg1\\narg2"')).toEqual(["cmd", "arg1\\narg2"]);
    expect(splitShellArgs("cmd 'arg1\\narg2'")).toEqual(["cmd", "arg1\\narg2"]);
  });

  it("should handle arguments with tabs", () => {
    expect(splitShellArgs('cmd "arg1\\targ2"')).toEqual(["cmd", "arg1\\targ2"]);
    expect(splitShellArgs("cmd 'arg1\\targ2'")).toEqual(["cmd", "arg1\\targ2"]);
  });
});
