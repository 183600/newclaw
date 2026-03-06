import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs(["node", "iflow", "gateway", "--dev", "--allow-unconfigured"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "iflow", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "iflow", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "iflow", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "iflow", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "iflow", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "iflow", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "iflow", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "iflow", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join("/home/peter", ".iflow-dev");
    expect(env.IFLOW_PROFILE).toBe("dev");
    expect(env.IFLOW_STATE_DIR).toBe(expectedStateDir);
    expect(env.IFLOW_CONFIG_PATH).toBe(path.join(expectedStateDir, "iflow.json"));
    expect(env.IFLOW_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      IFLOW_STATE_DIR: "/custom",
      IFLOW_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.IFLOW_STATE_DIR).toBe("/custom");
    expect(env.IFLOW_GATEWAY_PORT).toBe("19099");
    expect(env.IFLOW_CONFIG_PATH).toBe(path.join("/custom", "iflow.json"));
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("iflow doctor --fix", {})).toBe("iflow doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("iflow doctor --fix", { IFLOW_PROFILE: "default" })).toBe(
      "iflow doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("iflow doctor --fix", { IFLOW_PROFILE: "Default" })).toBe(
      "iflow doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("iflow doctor --fix", { IFLOW_PROFILE: "bad profile" })).toBe(
      "iflow doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(formatCliCommand("iflow --profile work doctor --fix", { IFLOW_PROFILE: "work" })).toBe(
      "iflow --profile work doctor --fix",
    );
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("iflow --dev doctor", { IFLOW_PROFILE: "dev" })).toBe(
      "iflow --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("iflow doctor --fix", { IFLOW_PROFILE: "work" })).toBe(
      "iflow --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("iflow doctor --fix", { IFLOW_PROFILE: "  jbiflow  " })).toBe(
      "iflow --profile jbiflow doctor --fix",
    );
  });

  it("handles command with no args after iflow", () => {
    expect(formatCliCommand("iflow", { IFLOW_PROFILE: "test" })).toBe("iflow --profile test");
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm iflow doctor", { IFLOW_PROFILE: "work" })).toBe(
      "pnpm iflow --profile work doctor",
    );
  });
});
