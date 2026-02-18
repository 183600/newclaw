import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GATEWAY_PORT,
  resolveCanonicalConfigPath,
  resolveDefaultConfigCandidates,
  resolveGatewayLockDir,
  resolveGatewayPort,
  resolveIsNixMode,
  resolveNewStateDir,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
  resolveUserPath,
} from "./paths.js";

describe("resolveIsNixMode", () => {
  it("returns true when OPENCLAW_NIX_MODE is '1'", () => {
    const env = { OPENCLAW_NIX_MODE: "1" };
    expect(resolveIsNixMode(env)).toBe(true);
  });

  it("returns false when OPENCLAW_NIX_MODE is not set", () => {
    const env = {};
    expect(resolveIsNixMode(env)).toBe(false);
  });

  it("returns false when OPENCLAW_NIX_MODE is not '1'", () => {
    const env = { OPENCLAW_NIX_MODE: "0" };
    expect(resolveIsNixMode(env)).toBe(false);
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home directory", () => {
    const input = "~/test";
    const expected = path.resolve(os.homedir(), "test");
    expect(resolveUserPath(input)).toBe(expected);
  });

  it("handles just ~", () => {
    const input = "~";
    const expected = path.resolve(os.homedir());
    expect(resolveUserPath(input)).toBe(expected);
  });

  it("resolves relative paths", () => {
    const input = "relative/path";
    const expected = path.resolve("relative/path");
    expect(resolveUserPath(input)).toBe(expected);
  });

  it("handles absolute paths", () => {
    const input = "/absolute/path";
    const expected = path.resolve("/absolute/path");
    expect(resolveUserPath(input)).toBe(expected);
  });

  it("trims whitespace", () => {
    const input = "  ~/test  ";
    const expected = path.resolve(os.homedir(), "test");
    expect(resolveUserPath(input)).toBe(expected);
  });

  it("returns empty string for empty input", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });
});

describe("resolveNewStateDir", () => {
  it("returns ~/.openclaw", () => {
    const expected = path.join(os.homedir(), ".openclaw");
    expect(resolveNewStateDir()).toBe(expected);
  });

  it("uses custom homedir function", () => {
    const customHome = "/custom/home";
    const expected = path.join(customHome, ".openclaw");
    expect(resolveNewStateDir(() => customHome)).toBe(expected);
  });
});

describe("resolveStateDir", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("uses OPENCLAW_STATE_DIR override", () => {
    const env = { OPENCLAW_STATE_DIR: path.join(tmpDir, "custom-state") };
    expect(resolveStateDir(env)).toBe(path.join(tmpDir, "custom-state"));
  });

  it("uses CLAWDBOT_STATE_DIR override", () => {
    const env = { CLAWDBOT_STATE_DIR: path.join(tmpDir, "legacy-state") };
    expect(resolveStateDir(env)).toBe(path.join(tmpDir, "legacy-state"));
  });

  it("prefers existing .openclaw directory", () => {
    const openclawDir = path.join(tmpDir, ".openclaw");
    fs.mkdirSync(openclawDir, { recursive: true });

    const env = {};
    const homedir = () => tmpDir;
    expect(resolveStateDir(env, homedir)).toBe(openclawDir);
  });

  it("falls back to legacy directory if it exists", () => {
    const legacyDir = path.join(tmpDir, ".clawdbot");
    fs.mkdirSync(legacyDir, { recursive: true });

    const env = {};
    const homedir = () => tmpDir;
    expect(resolveStateDir(env, homedir)).toBe(legacyDir);
  });

  it("returns new directory when none exist", () => {
    const env = {};
    const homedir = () => tmpDir;
    const expected = path.join(tmpDir, ".openclaw");
    expect(resolveStateDir(env, homedir)).toBe(expected);
  });
});

describe("resolveCanonicalConfigPath", () => {
  it("uses OPENCLAW_CONFIG_PATH override", () => {
    const env = { OPENCLAW_CONFIG_PATH: "/custom/config.json" };
    expect(resolveCanonicalConfigPath(env)).toBe("/custom/config.json");
  });

  it("uses CLAWDBOT_CONFIG_PATH override", () => {
    const env = { CLAWDBOT_CONFIG_PATH: "/legacy/config.json" };
    expect(resolveCanonicalConfigPath(env)).toBe("/legacy/config.json");
  });

  it("returns default path in state directory", () => {
    const stateDir = "/test/state";
    const expected = path.join(stateDir, "openclaw.json");
    expect(resolveCanonicalConfigPath({}, stateDir)).toBe(expected);
  });
});

describe("resolveDefaultConfigCandidates", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns explicit config path when provided", () => {
    const env = { OPENCLAW_CONFIG_PATH: "/explicit/config.json" };
    const candidates = resolveDefaultConfigCandidates(env, () => tmpDir);
    expect(candidates).toEqual(["/explicit/config.json"]);
  });

  it("returns state directory candidates when OPENCLAW_STATE_DIR is set", () => {
    const stateDir = path.join(tmpDir, "custom-state");
    const env = { OPENCLAW_STATE_DIR: stateDir };
    const candidates = resolveDefaultConfigCandidates(env, () => tmpDir);

    expect(candidates).toContain(path.join(stateDir, "openclaw.json"));
    expect(candidates).toContain(path.join(stateDir, "clawdbot.json"));
    expect(candidates).toContain(path.join(stateDir, "moltbot.json"));
    expect(candidates).toContain(path.join(stateDir, "moldbot.json"));
  });

  it("returns default directory candidates", () => {
    const env = {};
    const candidates = resolveDefaultConfigCandidates(env, () => tmpDir);

    expect(candidates).toContain(path.join(tmpDir, ".openclaw", "openclaw.json"));
    expect(candidates).toContain(path.join(tmpDir, ".clawdbot", "openclaw.json"));
    expect(candidates).toContain(path.join(tmpDir, ".moltbot", "openclaw.json"));
    expect(candidates).toContain(path.join(tmpDir, ".moldbot", "openclaw.json"));
  });
});

describe("resolveGatewayLockDir", () => {
  it("returns directory with uid when getuid is available", () => {
    const originalGetuid = process.getuid;
    process.getuid = vi.fn(() => 1234) as unknown;

    const expected = path.join(os.tmpdir(), "openclaw-1234");
    expect(resolveGatewayLockDir()).toBe(expected);

    process.getuid = originalGetuid;
  });

  it("returns directory without uid when getuid is not available", () => {
    const originalGetuid = process.getuid;
    delete (process as { getuid?: unknown }).getuid;

    const expected = path.join(os.tmpdir(), "openclaw");
    expect(resolveGatewayLockDir()).toBe(expected);

    process.getuid = originalGetuid;
  });

  it("uses custom tmpdir function", () => {
    const customTmp = "/custom/tmp";
    const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
    const suffix = uid != null ? `openclaw-${uid}` : "openclaw";
    const expected = path.join(customTmp, suffix);
    expect(resolveGatewayLockDir(() => customTmp)).toBe(expected);
  });
});

describe("resolveOAuthDir", () => {
  it("uses OPENCLAW_OAUTH_DIR override", () => {
    const env = { OPENCLAW_OAUTH_DIR: "/custom/oauth" };
    expect(resolveOAuthDir(env)).toBe("/custom/oauth");
  });

  it("returns credentials directory in state dir", () => {
    const stateDir = "/test/state";
    const expected = path.join(stateDir, "credentials");
    expect(resolveOAuthDir({}, stateDir)).toBe(expected);
  });
});

describe("resolveOAuthPath", () => {
  it("returns oauth.json path in oauth dir", () => {
    const stateDir = "/test/state";
    const expected = path.join(stateDir, "credentials", "oauth.json");
    expect(resolveOAuthPath({}, stateDir)).toBe(expected);
  });
});

describe("resolveGatewayPort", () => {
  it("uses OPENCLAW_GATEWAY_PORT env var", () => {
    const env = { OPENCLAW_GATEWAY_PORT: "9000" };
    expect(resolveGatewayPort(undefined, env)).toBe(9000);
  });

  it("uses CLAWDBOT_GATEWAY_PORT env var", () => {
    const env = { CLAWDBOT_GATEWAY_PORT: "8000" };
    expect(resolveGatewayPort(undefined, env)).toBe(8000);
  });

  it("uses config port", () => {
    const config = { gateway: { port: 7000 } };
    expect(resolveGatewayPort(config, {})).toBe(7000);
  });

  it("returns default port when no override", () => {
    expect(resolveGatewayPort(undefined, {})).toBe(DEFAULT_GATEWAY_PORT);
  });

  it("ignores invalid port numbers", () => {
    const env = { OPENCLAW_GATEWAY_PORT: "invalid" };
    expect(resolveGatewayPort(undefined, env)).toBe(DEFAULT_GATEWAY_PORT);
  });

  it("ignores negative port numbers", () => {
    const env = { OPENCLAW_GATEWAY_PORT: "-1" };
    expect(resolveGatewayPort(undefined, env)).toBe(DEFAULT_GATEWAY_PORT);
  });

  it("ignores zero port from config", () => {
    const config = { gateway: { port: 0 } };
    expect(resolveGatewayPort(config, {})).toBe(DEFAULT_GATEWAY_PORT);
  });
});
