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
    expect(hasHelpOrVersion(["node", "newclaw", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "newclaw", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "newclaw", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "newclaw", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "newclaw", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "newclaw", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "newclaw", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "newclaw"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "newclaw", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "newclaw", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "newclaw", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "newclaw", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "newclaw", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "newclaw", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "newclaw", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "newclaw", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "newclaw", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "newclaw", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "newclaw", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "newclaw", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "newclaw", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "newclaw", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node", "newclaw", "status"],
    });
    expect(nodeArgv).toEqual(["node", "newclaw", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node-22", "newclaw", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "newclaw", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node-22.2.0.exe", "newclaw", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "newclaw", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node-22.2", "newclaw", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "newclaw", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node-22.2.exe", "newclaw", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "newclaw", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["/usr/bin/node-22.2.0", "newclaw", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "newclaw", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["nodejs", "newclaw", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "newclaw", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["node-dev", "newclaw", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "newclaw", "node-dev", "newclaw", "status"]);

    const directArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["newclaw", "status"],
    });
    expect(directArgv).toEqual(["node", "newclaw", "status"]);

    const bunArgv = buildParseArgv({
      programName: "newclaw",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "newclaw",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "newclaw", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "newclaw", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "newclaw", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "newclaw", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "newclaw", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "newclaw", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "newclaw", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "newclaw", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
