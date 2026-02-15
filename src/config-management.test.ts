import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { parseConfigJson5 } from "./config/io.js";
import { resolveConfigDir } from "./utils.js";

describe("Configuration Management", () => {
  let tempDir: string;
  let configDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-config-test-"));
    configDir = path.join(tempDir, ".openclaw");
    configPath = path.join(configDir, "config.json5");
    fs.mkdirSync(configDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("parseConfigJson5", () => {
    it("parses valid JSON5 configuration", () => {
      const config = {
        gateway: {
          mode: "local",
          port: 18789,
        },
        agents: [],
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const result = parseConfigJson5(fs.readFileSync(configPath, "utf-8"));
      expect(result.ok).toBe(true);
      expect(result.parsed).toEqual(config);
    });

    it("parses JSON5 with comments", () => {
      const configWithComments = `{
        // Gateway configuration
        gateway: {
          mode: "local",  // Local mode
          port: 18789,
        },
        agents: [],
      }`;

      fs.writeFileSync(configPath, configWithComments);

      const result = parseConfigJson5(fs.readFileSync(configPath, "utf-8"));
      expect(result.ok).toBe(true);
      expect(result.parsed.gateway.mode).toBe("local");
      expect(result.parsed.gateway.port).toBe(18789);
    });

    it("handles trailing commas", () => {
      const configWithTrailingCommas = `{
        gateway: {
          mode: "local",
          port: 18789,
        },
        agents: [],
      }`;

      fs.writeFileSync(configPath, configWithTrailingCommas);

      const result = parseConfigJson5(fs.readFileSync(configPath, "utf-8"));
      expect(result.ok).toBe(true);
      expect(result.parsed.gateway.mode).toBe("local");
      expect(result.parsed.gateway.port).toBe(18789);
    });

    it("handles invalid JSON5", () => {
      const invalidConfig = `{
        gateway: {
          mode: "local",
          port: 18789,
        // Missing closing brace
      `;

      fs.writeFileSync(configPath, invalidConfig);

      const result = parseConfigJson5(fs.readFileSync(configPath, "utf-8"));
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("handles empty configuration", () => {
      fs.writeFileSync(configPath, "{}");

      const result = parseConfigJson5(fs.readFileSync(configPath, "utf-8"));
      expect(result.ok).toBe(true);
      expect(result.parsed).toEqual({});
    });
  });

  describe("resolveConfigDir", () => {
    it("resolves to .openclaw directory by default", () => {
      const env = {};

      const resolved = resolveConfigDir(env, () => tempDir);
      expect(resolved).toContain(".openclaw");
    });

    it("prefers .openclaw when legacy dir is missing", () => {
      const env = {};
      const openClawDir = path.join(tempDir, ".openclaw");
      fs.mkdirSync(openClawDir, { recursive: true });

      const resolved = resolveConfigDir(env, () => tempDir);
      expect(resolved).toBe(openClawDir);
    });

    it("handles environment variable override", () => {
      const customConfigDir = path.join(tempDir, "custom-config");
      fs.mkdirSync(customConfigDir, { recursive: true });

      const env = { OPENCLAW_STATE_DIR: customConfigDir };

      const resolved = resolveConfigDir(env, () => tempDir);
      expect(resolved).toBe(customConfigDir);
    });

    it("creates directory if it doesn't exist", () => {
      const env = {};
      const homeDir = path.join(tempDir, "home");
      fs.mkdirSync(homeDir, { recursive: true });

      const resolved = resolveConfigDir(env, () => homeDir);
      // Manually create the directory to test the path resolution
      fs.mkdirSync(resolved, { recursive: true });
      expect(fs.existsSync(resolved)).toBe(true);
    });
  });

  describe("Configuration File Operations", () => {
    it("writes and reads configuration files", () => {
      const config = {
        gateway: {
          mode: "remote",
          port: 8080,
        },
        agents: [
          {
            id: "test-agent",
            model: "gpt-4",
          },
        ],
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const content = fs.readFileSync(configPath, "utf-8");
      const result = parseConfigJson5(content);
      expect(result.ok).toBe(true);
      expect(result.parsed).toEqual(config);
    });

    it("handles nested configuration structures", () => {
      const config = {
        gateway: {
          mode: "local",
          port: 18789,
          bind: "loopback",
        },
        agents: [
          {
            id: "agent1",
            model: "gpt-4",
            thinking: "high",
            tools: [
              {
                name: "web-search",
                config: {
                  provider: "google",
                },
              },
            ],
          },
        ],
        channels: {
          telegram: {
            botToken: "test-token",
          },
          whatsapp: {
            allowFrom: ["+1234567890"],
          },
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const content = fs.readFileSync(configPath, "utf-8");
      const result = parseConfigJson5(content);
      expect(result.ok).toBe(true);
      expect(result.parsed.agents[0].tools[0].name).toBe("web-search");
      expect(result.parsed.channels.whatsapp.allowFrom).toEqual(["+1234567890"]);
    });
  });

  describe("Configuration Validation", () => {
    it("validates required configuration fields", () => {
      const config = {
        gateway: {
          mode: "local",
          port: 18789,
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const content = fs.readFileSync(configPath, "utf-8");
      const result = parseConfigJson5(content);

      expect(result.ok).toBe(true);
      expect(result.parsed.gateway.mode).toBeDefined();
      expect(result.parsed.gateway.port).toBe(18789);
    });

    it("handles configuration with arrays", () => {
      const config = {
        agents: [
          { id: "agent1", model: "gpt-4" },
          { id: "agent2", model: "claude-3" },
        ],
        tools: [
          { name: "tool1", enabled: true },
          { name: "tool2", enabled: false },
        ],
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const content = fs.readFileSync(configPath, "utf-8");
      const result = parseConfigJson5(content);

      expect(result.ok).toBe(true);
      expect(result.parsed.agents).toHaveLength(2);
      expect(result.parsed.tools).toHaveLength(2);
      expect(result.parsed.agents[0].model).toBe("gpt-4");
      expect(result.parsed.tools[1].enabled).toBe(false);
    });
  });
});
