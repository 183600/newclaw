import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";

describe("formatCliCommand", () => {
  it("should return original command when no profile is set", () => {
    const env = { IFLOW_PROFILE: "" };
    const command = "iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when IFLOW_PROFILE is undefined", () => {
    const env = {};
    const command = "iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when CLI prefix is not found", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "some-other-command --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should add profile flag to iflow command", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("iflow --profile dev --help");
  });

  it("should add profile flag to pnpm iflow command", () => {
    const env = { IFLOW_PROFILE: "prod" };
    const command = "pnpm iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm iflow --profile prod --help");
  });

  it("should add profile flag to npm iflow command", () => {
    const env = { IFLOW_PROFILE: "staging" };
    const command = "npm iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npm iflow --profile staging --help");
  });

  it("should add profile flag to bunx iflow command", () => {
    const env = { IFLOW_PROFILE: "test" };
    const command = "bunx iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("bunx iflow --profile test --help");
  });

  it("should add profile flag to npx iflow command", () => {
    const env = { IFLOW_PROFILE: "custom" };
    const command = "npx iflow --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npx iflow --profile custom --help");
  });

  it("should not add profile flag when --profile flag already exists", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow --profile prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --profile flag exists with equals", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow --profile=prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --dev flag exists", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow --dev --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with multiple spaces", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "pnpm  iflow  --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm  iflow --profile dev  --help");
  });

  it("should handle command with profile flag at end", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow --help --profile";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle empty command", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with no arguments", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "iflow";
    const result = formatCliCommand(command, env);

    expect(result).toBe("iflow --profile dev");
  });

  it("should handle command with complex arguments", () => {
    const env = { IFLOW_PROFILE: "prod" };
    const command = "pnpm iflow agent --mode rpc --json";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm iflow --profile prod agent --mode rpc --json");
  });
});
