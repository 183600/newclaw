import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "newclaw",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "newclaw", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "newclaw", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "newclaw", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "newclaw", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "newclaw", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "newclaw", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "newclaw", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "newclaw", "--profile", "work", "--dev", "status"]);
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
    const expectedStateDir = path.join("/home/peter", ".newclaw-dev");
    expect(env.NEWCLAW_PROFILE).toBe("dev");
    expect(env.NEWCLAW_STATE_DIR).toBe(expectedStateDir);
    expect(env.NEWCLAW_CONFIG_PATH).toBe(path.join(expectedStateDir, "newclaw.json"));
    expect(env.NEWCLAW_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      NEWCLAW_STATE_DIR: "/custom",
      NEWCLAW_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.NEWCLAW_STATE_DIR).toBe("/custom");
    expect(env.NEWCLAW_GATEWAY_PORT).toBe("19099");
    expect(env.NEWCLAW_CONFIG_PATH).toBe(path.join("/custom", "newclaw.json"));
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("newclaw doctor --fix", {})).toBe("newclaw doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("newclaw doctor --fix", { NEWCLAW_PROFILE: "default" })).toBe(
      "newclaw doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("newclaw doctor --fix", { NEWCLAW_PROFILE: "Default" })).toBe(
      "newclaw doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("newclaw doctor --fix", { NEWCLAW_PROFILE: "bad profile" })).toBe(
      "newclaw doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("newclaw --profile work doctor --fix", { NEWCLAW_PROFILE: "work" }),
    ).toBe("newclaw --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("newclaw --dev doctor", { NEWCLAW_PROFILE: "dev" })).toBe(
      "newclaw --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("newclaw doctor --fix", { NEWCLAW_PROFILE: "work" })).toBe(
      "newclaw --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("newclaw doctor --fix", { NEWCLAW_PROFILE: "  jbnewclaw  " })).toBe(
      "newclaw --profile jbnewclaw doctor --fix",
    );
  });

  it("handles command with no args after newclaw", () => {
    expect(formatCliCommand("newclaw", { NEWCLAW_PROFILE: "test" })).toBe("newclaw --profile test");
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm newclaw doctor", { NEWCLAW_PROFILE: "work" })).toBe(
      "pnpm newclaw --profile work doctor",
    );
  });
});
