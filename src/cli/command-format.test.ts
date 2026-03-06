import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";

describe("formatCliCommand", () => {
  it("should return original command when no profile is set", () => {
    const env = { IFLOW_PROFILE: "" };
    const command = "claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when IFLOW_PROFILE is undefined", () => {
    const env = {};
    const command = "claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when CLI prefix is not found", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "some-other-command --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should add profile flag to claw command", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("claw --profile dev --help");
  });

  it("should add profile flag to pnpm claw command", () => {
    const env = { IFLOW_PROFILE: "prod" };
    const command = "pnpm claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm claw --profile prod --help");
  });

  it("should add profile flag to npm claw command", () => {
    const env = { IFLOW_PROFILE: "staging" };
    const command = "npm claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npm claw --profile staging --help");
  });

  it("should add profile flag to bunx claw command", () => {
    const env = { IFLOW_PROFILE: "test" };
    const command = "bunx claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("bunx claw --profile test --help");
  });

  it("should add profile flag to npx claw command", () => {
    const env = { IFLOW_PROFILE: "custom" };
    const command = "npx claw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npx claw --profile custom --help");
  });

  it("should not add profile flag when --profile flag already exists", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "claw --profile prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --profile flag exists with equals", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "claw --profile=prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --dev flag exists", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "claw --dev --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with multiple spaces", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "pnpm  claw  --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm  claw --profile dev  --help");
  });

  it("should handle command with profile flag at end", () => {
    const env = { IFLOW_PROFILE: "dev" };
    const command = "claw --help --profile";
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
    const command = "claw";
    const result = formatCliCommand(command, env);

    expect(result).toBe("claw --profile dev");
  });

  it("should handle command with complex arguments", () => {
    const env = { IFLOW_PROFILE: "prod" };
    const command = "pnpm claw agent --mode rpc --json";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm claw --profile prod agent --mode rpc --json");
  });
});
