import { describe, expect, it } from "vitest";
import type { NewClawConfig } from "./config/types.js";
import {
  DEFAULT_AGENT_MAX_CONCURRENT,
  DEFAULT_SUBAGENT_MAX_CONCURRENT,
  resolveAgentMaxConcurrent,
  resolveSubagentMaxConcurrent,
} from "./config/agent-limits.js";

describe("agent-limits", () => {
  describe("resolveAgentMaxConcurrent", () => {
    it("returns default when config is undefined", () => {
      expect(resolveAgentMaxConcurrent()).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
      expect(resolveAgentMaxConcurrent(undefined)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });

    it("returns default when agents section is missing", () => {
      const cfg = {} as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });

    it("returns default when defaults section is missing", () => {
      const cfg = { agents: {} } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });

    it("returns default when maxConcurrent is not set", () => {
      const cfg = { agents: { defaults: {} } } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });

    it("returns configured value when valid", () => {
      const cfg = {
        agents: { defaults: { maxConcurrent: 10 } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(10);
    });

    it("clamps to minimum of 1", () => {
      const cfg = {
        agents: { defaults: { maxConcurrent: 0 } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(1);

      const cfg2 = {
        agents: { defaults: { maxConcurrent: -5 } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg2)).toBe(1);
    });

    it("floors decimal values", () => {
      const cfg = {
        agents: { defaults: { maxConcurrent: 4.7 } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(4);

      const cfg2 = {
        agents: { defaults: { maxConcurrent: 4.2 } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg2)).toBe(4);
    });

    it("handles infinite values", () => {
      const cfg = {
        agents: { defaults: { maxConcurrent: Infinity } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);

      const cfg2 = {
        agents: { defaults: { maxConcurrent: -Infinity } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg2)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });

    it("handles NaN values", () => {
      const cfg = {
        agents: { defaults: { maxConcurrent: NaN } },
      } as NewClawConfig;
      expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
    });
  });

  describe("resolveSubagentMaxConcurrent", () => {
    it("returns default when config is undefined", () => {
      expect(resolveSubagentMaxConcurrent()).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
      expect(resolveSubagentMaxConcurrent(undefined)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("returns default when agents section is missing", () => {
      const cfg = {} as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("returns default when defaults section is missing", () => {
      const cfg = { agents: {} } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("returns default when subagents section is missing", () => {
      const cfg = { agents: { defaults: {} } } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("returns default when maxConcurrent is not set", () => {
      const cfg = {
        agents: { defaults: { subagents: {} } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("returns configured value when valid", () => {
      const cfg = {
        agents: { defaults: { subagents: { maxConcurrent: 15 } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(15);
    });

    it("clamps to minimum of 1", () => {
      const cfg = {
        agents: { defaults: { subagents: { maxConcurrent: 0 } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(1);

      const cfg2 = {
        agents: { defaults: { subagents: { maxConcurrent: -3 } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg2)).toBe(1);
    });

    it("floors decimal values", () => {
      const cfg = {
        agents: { defaults: { subagents: { maxConcurrent: 8.9 } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(8);

      const cfg2 = {
        agents: { defaults: { subagents: { maxConcurrent: 8.1 } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg2)).toBe(8);
    });

    it("handles infinite values", () => {
      const cfg = {
        agents: { defaults: { subagents: { maxConcurrent: Infinity } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);

      const cfg2 = {
        agents: { defaults: { subagents: { maxConcurrent: -Infinity } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg2)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });

    it("handles NaN values", () => {
      const cfg = {
        agents: { defaults: { subagents: { maxConcurrent: NaN } } },
      } as NewClawConfig;
      expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
    });
  });

  describe("constants", () => {
    it("has reasonable default values", () => {
      expect(DEFAULT_AGENT_MAX_CONCURRENT).toBe(4);
      expect(DEFAULT_SUBAGENT_MAX_CONCURRENT).toBe(8);
      expect(DEFAULT_SUBAGENT_MAX_CONCURRENT).toBeGreaterThan(DEFAULT_AGENT_MAX_CONCURRENT);
    });
  });
});
