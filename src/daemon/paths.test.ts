import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".iflow"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", CLAW_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".iflow-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", CLAW_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".iflow"));
  });

  it("uses CLAW_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", CLAW_STATE_DIR: "/var/lib/claw" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/claw"));
  });

  it("expands ~ in CLAW_STATE_DIR", () => {
    const env = { HOME: "/Users/test", CLAW_STATE_DIR: "~/claw-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/claw-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { CLAW_STATE_DIR: "C:\\State\\claw" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\claw");
  });
});
