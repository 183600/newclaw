import { describe, expect, it } from "vitest";
import { resolveCliName, replaceCliName, DEFAULT_CLI_NAME } from "./cli-name.js";

describe("resolveCliName", () => {
  it("should return default CLI name when no argv provided", () => {
    expect(resolveCliName()).toBe(DEFAULT_CLI_NAME);
  });

  it("should return default CLI name when argv[1] is empty", () => {
    expect(resolveCliName(["node", ""])).toBe(DEFAULT_CLI_NAME);
  });

  it("should return default CLI name when argv[1] is unknown", () => {
    expect(resolveCliName(["node", "unknown-cli"])).toBe(DEFAULT_CLI_NAME);
  });

  it("should return iflow when argv[1] is iflow", () => {
    expect(resolveCliName(["node", "iflow"])).toBe("iflow");
  });

  it("should handle basename with path", () => {
    expect(resolveCliName(["node", "/usr/bin/iflow"])).toBe("iflow");
  });

  it("should handle relative path", () => {
    expect(resolveCliName(["node", "./iflow"])).toBe("iflow");
  });

  it("should trim whitespace", () => {
    expect(resolveCliName(["node", "  iflow  "])).toBe("iflow");
  });
});

describe("replaceCliName", () => {
  it("should return empty string when input is empty", () => {
    expect(replaceCliName("")).toBe("");
  });

  it("should return empty string when input is whitespace", () => {
    expect(replaceCliName("   ")).toBe("   ");
  });

  it("should return original string when no CLI prefix is found", () => {
    const command = "some other command";
    expect(replaceCliName(command)).toBe(command);
  });

  it("should replace iflow with custom CLI name", () => {
    const command = "iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("myclaw --help");
  });

  it("should replace iflow with default CLI name when no custom name provided", () => {
    const command = "iflow --help";
    const result = replaceCliName(command);
    expect(result).toBe(`${DEFAULT_CLI_NAME} --help`);
  });

  it("should preserve runner prefix", () => {
    const command = "pnpm iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("pnpm myclaw --help");
  });

  it("should handle npm runner", () => {
    const command = "npm iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("npm myclaw --help");
  });

  it("should handle bunx runner", () => {
    const command = "bunx iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("bunx myclaw --help");
  });

  it("should handle npx runner", () => {
    const command = "npx iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("npx myclaw --help");
  });

  it("should handle multiple spaces in runner", () => {
    const command = "pnpm  iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("pnpm  myclaw --help");
  });

  it("should handle word boundary correctly", () => {
    const command = "notiflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("notiflow --help");
  });

  it("should not replace iflow in the middle of command", () => {
    const command = "run iflow --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("run iflow --help");
  });
});
