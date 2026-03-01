import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";

describe("formatCliCommand", () => {
  it("should return original command when no profile is set", () => {
    const env = { NEWCLAW_PROFILE: "" };
    const command = "newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when NEWCLAW_PROFILE is undefined", () => {
    const env = {};
    const command = "newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should return original command when CLI prefix is not found", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "some-other-command --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should add profile flag to newclaw command", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("newclaw --profile dev --help");
  });

  it("should add profile flag to pnpm newclaw command", () => {
    const env = { NEWCLAW_PROFILE: "prod" };
    const command = "pnpm newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm newclaw --profile prod --help");
  });

  it("should add profile flag to npm newclaw command", () => {
    const env = { NEWCLAW_PROFILE: "staging" };
    const command = "npm newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npm newclaw --profile staging --help");
  });

  it("should add profile flag to bunx newclaw command", () => {
    const env = { NEWCLAW_PROFILE: "test" };
    const command = "bunx newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("bunx newclaw --profile test --help");
  });

  it("should add profile flag to npx newclaw command", () => {
    const env = { NEWCLAW_PROFILE: "custom" };
    const command = "npx newclaw --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("npx newclaw --profile custom --help");
  });

  it("should not add profile flag when --profile flag already exists", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw --profile prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --profile flag exists with equals", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw --profile=prod --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should not add profile flag when --dev flag exists", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw --dev --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with multiple spaces", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "pnpm  newclaw  --help";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm  newclaw --profile dev  --help");
  });

  it("should handle command with profile flag at end", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw --help --profile";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle empty command", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "";
    const result = formatCliCommand(command, env);

    expect(result).toBe(command);
  });

  it("should handle command with no arguments", () => {
    const env = { NEWCLAW_PROFILE: "dev" };
    const command = "newclaw";
    const result = formatCliCommand(command, env);

    expect(result).toBe("newclaw --profile dev");
  });

  it("should handle command with complex arguments", () => {
    const env = { NEWCLAW_PROFILE: "prod" };
    const command = "pnpm newclaw agent --mode rpc --json";
    const result = formatCliCommand(command, env);

    expect(result).toBe("pnpm newclaw --profile prod agent --mode rpc --json");
  });
});
