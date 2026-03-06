import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "claw", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "claw", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "claw", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "claw", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "claw", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "claw", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "claw", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "claw"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "claw", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "claw", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "claw", "status", "--timeout", "5000"], "--timeout")).toBe("5000");
    expect(getFlagValue(["node", "claw", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "claw", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "claw", "status", "--timeout", "--json"], "--timeout")).toBe(null);
    expect(getFlagValue(["node", "claw", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "claw", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "claw", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "claw", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "claw", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "claw", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "claw", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "claw", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node", "claw", "status"],
    });
    expect(nodeArgv).toEqual(["node", "claw", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node-22", "claw", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "claw", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node-22.2.0.exe", "claw", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "claw", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node-22.2", "claw", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "claw", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node-22.2.exe", "claw", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "claw", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["/usr/bin/node-22.2.0", "claw", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "claw", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["nodejs", "claw", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "claw", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["node-dev", "claw", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "claw", "node-dev", "claw", "status"]);

    const directArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["claw", "status"],
    });
    expect(directArgv).toEqual(["node", "claw", "status"]);

    const bunArgv = buildParseArgv({
      programName: "claw",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "claw",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "claw", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "claw", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "claw", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "claw", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "claw", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "claw", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "claw", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "claw", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
