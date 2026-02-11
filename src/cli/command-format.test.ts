import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";

describe("formatCliCommand", () => {
  it("should return original command when no profile is set", () => {
    const env = { OPENCLAW_PROFILE: "" };
    const command = "openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when OPENCLAW_PROFILE is undefined", () => {
    const env = {};
    const command = "openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when CLI prefix is not found", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "some-other-command --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should add profile flag to openclaw command", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("openclaw --profile dev --help");
  });

  it("should add profile flag to pnpm openclaw command", () => {
    const env = { OPENCLAW_PROFILE: "prod" };
    const command = "pnpm openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm openclaw --profile prod --help");
  });

  it("should add profile flag to npm openclaw command", () => {
    const env = { OPENCLAW_PROFILE: "staging" };
    const command = "npm openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npm openclaw --profile staging --help");
  });

  it("should add profile flag to bunx openclaw command", () => {
    const env = { OPENCLAW_PROFILE: "test" };
    const command = "bunx openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("bunx openclaw --profile test --help");
  });

  it("should add profile flag to npx openclaw command", () => {
    const env = { OPENCLAW_PROFILE: "custom" };
    const command = "npx openclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npx openclaw --profile custom --help");
  });

  it("should not add profile flag when --profile flag already exists", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw --profile prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --profile flag exists with equals", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw --profile=prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --dev flag exists", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw --dev --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with multiple spaces", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "pnpm  openclaw  --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm  openclaw --profile dev  --help");
  });

  it("should handle command with profile flag at end", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw --help --profile";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle empty command", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with no arguments", () => {
    const env = { OPENCLAW_PROFILE: "dev" };
    const command = "openclaw";
    const result = formatCliCommand(command, env);

    expect(result).toBe("openclaw --profile dev");
  });

  it("should handle command with complex arguments", () => {
    const env = { OPENCLAW_PROFILE: "prod" };
    const command = "pnpm openclaw agent --mode rpc --json";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm openclaw --profile prod agent --mode rpc --json");
  });
});
