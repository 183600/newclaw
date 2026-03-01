import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".newclaw"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", NEWCLAW_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".newclaw-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", NEWCLAW_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".newclaw"));
  });

  it("uses NEWCLAW_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", NEWCLAW_STATE_DIR: "/var/lib/newclaw" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/newclaw"));
  });

  it("expands ~ in NEWCLAW_STATE_DIR", () => {
    const env = { HOME: "/Users/test", NEWCLAW_STATE_DIR: "~/newclaw-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/newclaw-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { NEWCLAW_STATE_DIR: "C:\\State\\newclaw" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\newclaw");
  });
});
