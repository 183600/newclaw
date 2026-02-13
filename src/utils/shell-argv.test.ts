import { describe, expect, it } from "vitest";
import { splitShellArgs } from "./shell-argv.js";

describe("splitShellArgs", () => {
  it("splits simple space-separated arguments", () => {
    const result = splitShellArgs("command arg1 arg2");
    expect(result).toEqual(["command", "arg1", "arg2"]);
  });

  it("handles multiple spaces", () => {
    const result = splitShellArgs("command   arg1    arg2");
    expect(result).toEqual(["command", "arg1", "arg2"]);
  });

  it("handles leading and trailing spaces", () => {
    const result = splitShellArgs("  command arg1 arg2  ");
    expect(result).toEqual(["command", "arg1", "arg2"]);
  });

  it("preserves quoted strings", () => {
    const result = splitShellArgs('command "arg with spaces" arg2');
    expect(result).toEqual(["command", "arg with spaces", "arg2"]);
  });

  it("handles single quotes", () => {
    const result = splitShellArgs("command 'arg with spaces' arg2");
    expect(result).toEqual(["command", "arg with spaces", "arg2"]);
  });

  it("handles mixed quotes", () => {
    const result = splitShellArgs("command \"arg1\" 'arg2' arg3");
    expect(result).toEqual(["command", "arg1", "arg2", "arg3"]);
  });

  it("handles escaped spaces", () => {
    const result = splitShellArgs("command arg\\ with\\ spaces arg2");
    expect(result).toEqual(["command", "arg with spaces", "arg2"]);
  });

  it("handles escaped quotes in double quotes", () => {
    const result = splitShellArgs('command "arg with \"embedded quotes\" arg2" arg3');
    expect(result).toEqual(["command", "arg with embedded", "quotes arg2", "arg3"]);
  });

  it("handles escaped characters", () => {
    const result = splitShellArgs("command arg\\$value arg\\[1\\]");
    expect(result).toEqual(["command", "arg$value", "arg[1]"]);
  });

  it("returns empty array for empty string", () => {
    const result = splitShellArgs("");
    expect(result).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    const result = splitShellArgs("   \t  \n  ");
    expect(result).toEqual([]);
  });

  it("handles tabs and other whitespace", () => {
    const result = splitShellArgs("command\targ1\narg2\rarg3");
    expect(result).toEqual(["command", "arg1", "arg2", "arg3"]);
  });

  it("returns null for unclosed single quotes", () => {
    const result = splitShellArgs("command 'unclosed quote");
    expect(result).toBeNull();
  });

  it("returns null for unclosed double quotes", () => {
    const result = splitShellArgs('command "unclosed quote');
    expect(result).toBeNull();
  });

  it("returns null for trailing escape", () => {
    const result = splitShellArgs("command arg\\");
    expect(result).toBeNull();
  });

  it("handles empty quoted strings", () => {
    const result = splitShellArgs('command "" arg2');
    expect(result).toEqual(["command", "arg2"]);
  });

  it("handles empty single quoted strings", () => {
    const result = splitShellArgs("command '' arg2");
    expect(result).toEqual(["command", "arg2"]);
  });

  it("handles quotes with spaces at edges", () => {
    const result = splitShellArgs('command "  spaced arg  " arg2');
    expect(result).toEqual(["command", "  spaced arg  ", "arg2"]);
  });

  it("handles complex nested scenarios", () => {
    const result = splitShellArgs('git commit -m "Fix bug with \"quotes\" and spaces"');
    expect(result).toEqual(["git", "commit", "-m", "Fix bug with quotes and spaces"]);
  });

  it("handles escaped backslashes", () => {
    const result = splitShellArgs("command arg\\\\value arg2");
    expect(result).toEqual(["command", "arg\\value", "arg2"]);
  });

  it("handles escaped backslashes in quotes", () => {
    const result = splitShellArgs('command "arg\\\\value" arg2');
    expect(result).toEqual(["command", "arg\\\\value", "arg2"]);
  });

  it("handles single quotes with escaped characters (literal)", () => {
    const result = splitShellArgs("command 'arg\\nvalue' arg2");
    expect(result).toEqual(["command", "arg\\nvalue", "arg2"]);
  });

  it("preserves escape sequences in double quotes", () => {
    const result = splitShellArgs('command "arg\nvalue" arg2');
    expect(result).toEqual(["command", "arg\nvalue", "arg2"]);
  });

  it("handles real-world command example", () => {
    const result = splitShellArgs('ssh user@host "ls -la \"/path with spaces/\""');
    expect(result).toEqual(["ssh", "user@host", "ls -la /path", "with", "spaces/"]);
  });

  it("handles command with array-like syntax", () => {
    const result = splitShellArgs('node script.js --files ["file1","file2"] --verbose');
    expect(result).toEqual(["node", "script.js", "--files", "[file1,file2]", "--verbose"]);
  });

  it("handles command with regex pattern", () => {
    const result = splitShellArgs('grep --pattern "test.*[0-9]+" file.txt');
    expect(result).toEqual(["grep", "--pattern", "test.*[0-9]+", "file.txt"]);
  });
});
