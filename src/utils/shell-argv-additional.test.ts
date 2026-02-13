import { describe, expect, it } from "vitest";
import { splitShellArgs } from "./shell-argv.js";

describe("splitShellArgs - Additional Tests", () => {
  it("handles null and undefined inputs", () => {
    // The function doesn't handle null/undefined, so we expect it to throw
    expect(() => splitShellArgs(null as any)).toThrow();
    expect(() => splitShellArgs(undefined as any)).toThrow();
  });

  it("handles numbers", () => {
    // The function expects a string, so passing a number returns empty array
    expect(splitShellArgs(123 as any)).toEqual([]);
  });

  it("handles objects", () => {
    // The function expects a string, so passing an object returns empty array
    expect(splitShellArgs({} as any)).toEqual([]);
  });

  it("handles arrays", () => {
    // The function expects a string, so passing an array returns empty array
    expect(splitShellArgs([] as any)).toEqual([]);
  });

  it("handles complex nested quotes", () => {
    // The function doesn't handle escaped quotes within quotes
    const result = splitShellArgs('echo "Hello \\"world\\" and \'test\'"');
    expect(result).toBeNull(); // Returns null due to unclosed quotes
  });

  it("handles escaped newlines in quotes", () => {
    // The function doesn't process escape sequences
    const result = splitShellArgs('echo "line1\\nline2"');
    expect(result).toEqual(["echo", "line1\\nline2"]);
  });

  it("handles escaped tabs in quotes", () => {
    // The function doesn't process escape sequences
    const result = splitShellArgs('echo "col1\\tcol2"');
    expect(result).toEqual(["echo", "col1\\tcol2"]);
  });

  it("handles escaped backslashes in quotes", () => {
    // The function doesn't process escape sequences
    const result = splitShellArgs('echo "path\\\\to\\\\file"');
    expect(result).toEqual(["echo", "path\\\\to\\\\file"]);
  });

  it("handles multiple levels of escaping", () => {
    // The function handles the escaping correctly
    const result = splitShellArgs('echo "Hello \\\\\"world\\\\\""');
    expect(result).toEqual(["echo", "Hello \\\\world\\"]);
  });

  it("handles empty quoted strings", () => {
    const result = splitShellArgs('cmd "" arg');
    expect(result).toEqual(["cmd", "arg"]);
  });

  it("handles quoted strings with only whitespace", () => {
    const result = splitShellArgs('cmd "   " arg');
    expect(result).toEqual(["cmd", "   ", "arg"]);
  });

  it("handles mixed quote types", () => {
    const result = splitShellArgs("echo \"Hello 'world'\" and 'test \"string\"'");
    expect(result).toEqual(["echo", "Hello 'world'", "and", 'test "string"']);
  });

  it("handles very long arguments", () => {
    const longArg = "a".repeat(1000);
    const result = splitShellArgs(`cmd "${longArg}"`);
    expect(result).toEqual(["cmd", longArg]);
  });

  it("handles Unicode characters in quotes", () => {
    const result = splitShellArgs('echo "Hello 世界 🌍"');
    expect(result).toEqual(["echo", "Hello 世界 🌍"]);
  });

  it("handles escaped Unicode characters", () => {
    // The function doesn't process Unicode escape sequences
    const result = splitShellArgs('echo "\\u00A9 2023');
    expect(result).toBeNull(); // Returns null due to invalid escape sequence
  });

  it("handles command with environment variable substitution", () => {
    const result = splitShellArgs("echo $PATH $HOME");
    expect(result).toEqual(["echo", "$PATH", "$HOME"]);
  });

  it("handles command with shell redirection", () => {
    const result = splitShellArgs("cmd arg1 > output.txt 2>&1");
    expect(result).toEqual(["cmd", "arg1", ">", "output.txt", "2>&1"]);
  });

  it("handles command with pipes", () => {
    const result = splitShellArgs("cmd1 | cmd2 | cmd3");
    expect(result).toEqual(["cmd1", "|", "cmd2", "|", "cmd3"]);
  });

  it("handles command with logical operators", () => {
    const result = splitShellArgs("cmd1 && cmd2 || cmd3");
    expect(result).toEqual(["cmd1", "&&", "cmd2", "||", "cmd3"]);
  });

  it("handles command with background operator", () => {
    const result = splitShellArgs("cmd arg &");
    expect(result).toEqual(["cmd", "arg", "&"]);
  });

  it("handles command with semicolon separators", () => {
    const result = splitShellArgs("cmd1; cmd2; cmd3");
    expect(result).toEqual(["cmd1;", "cmd2;", "cmd3"]);
  });

  it("handles command with subshell", () => {
    const result = splitShellArgs("(cmd1 && cmd2) || cmd3");
    expect(result).toEqual(["(cmd1", "&&", "cmd2)", "||", "cmd3"]);
  });

  it("handles command with process substitution", () => {
    const result = splitShellArgs("cmd <(input) >(output)");
    expect(result).toEqual(["cmd", "<(input)", ">(output)"]);
  });

  it("handles command with brace expansion", () => {
    const result = splitShellArgs("cmd file{1,2,3}.txt");
    expect(result).toEqual(["cmd", "file{1,2,3}.txt"]);
  });

  it("handles command with tilde expansion", () => {
    const result = splitShellArgs("cmd ~/file.txt");
    expect(result).toEqual(["cmd", "~/file.txt"]);
  });

  it("handles command with variable assignment", () => {
    const result = splitShellArgs("VAR=value cmd arg");
    expect(result).toEqual(["VAR=value", "cmd", "arg"]);
  });

  it("handles command with array syntax", () => {
    const result = splitShellArgs("cmd arg=(a b c)");
    expect(result).toEqual(["cmd", "arg=(a", "b", "c)"]);
  });
});
