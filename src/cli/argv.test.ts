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
    expect(hasHelpOrVersion(["node", "iflow", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "iflow", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "iflow", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "iflow", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "iflow", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "iflow", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "iflow", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "iflow"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "iflow", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "iflow", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "iflow", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "iflow", "status", "--timeout=2500"], "--timeout")).toBe("2500");
    expect(getFlagValue(["node", "iflow", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "iflow", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "iflow", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "iflow", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "iflow", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "iflow", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "iflow", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "iflow", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "iflow", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "iflow", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node", "iflow", "status"],
    });
    expect(nodeArgv).toEqual(["node", "iflow", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node-22", "iflow", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "iflow", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node-22.2.0.exe", "iflow", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "iflow", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node-22.2", "iflow", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "iflow", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node-22.2.exe", "iflow", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "iflow", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["/usr/bin/node-22.2.0", "iflow", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "iflow", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["nodejs", "iflow", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "iflow", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["node-dev", "iflow", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "iflow", "node-dev", "iflow", "status"]);

    const directArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["iflow", "status"],
    });
    expect(directArgv).toEqual(["node", "iflow", "status"]);

    const bunArgv = buildParseArgv({
      programName: "iflow",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "iflow",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "iflow", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "iflow", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "iflow", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "iflow", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "iflow", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "iflow", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "iflow", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "iflow", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
