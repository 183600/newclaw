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

  it("should return newclaw when argv[1] is newclaw", () => {
    expect(resolveCliName(["node", "newclaw"])).toBe("newclaw");
  });

  it("should handle basename with path", () => {
    expect(resolveCliName(["node", "/usr/bin/newclaw"])).toBe("newclaw");
  });

  it("should handle relative path", () => {
    expect(resolveCliName(["node", "./newclaw"])).toBe("newclaw");
  });

  it("should trim whitespace", () => {
    expect(resolveCliName(["node", "  newclaw  "])).toBe("newclaw");
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

  it("should replace newclaw with custom CLI name", () => {
    const command = "newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("myclaw --help");
  });

  it("should replace newclaw with default CLI name when no custom name provided", () => {
    const command = "newclaw --help";
    const result = replaceCliName(command);
    expect(result).toBe(`${DEFAULT_CLI_NAME} --help`);
  });

  it("should preserve runner prefix", () => {
    const command = "pnpm newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("pnpm myclaw --help");
  });

  it("should handle npm runner", () => {
    const command = "npm newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("npm myclaw --help");
  });

  it("should handle bunx runner", () => {
    const command = "bunx newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("bunx myclaw --help");
  });

  it("should handle npx runner", () => {
    const command = "npx newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("npx myclaw --help");
  });

  it("should handle multiple spaces in runner", () => {
    const command = "pnpm  newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("pnpm  myclaw --help");
  });

  it("should handle word boundary correctly", () => {
    const command = "notnewclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("notnewclaw --help");
  });

  it("should not replace newclaw in the middle of command", () => {
    const command = "run newclaw --help";
    const result = replaceCliName(command, "myclaw");
    expect(result).toBe("run newclaw --help");
  });
});
