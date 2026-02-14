import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "./types.js";
import {
  DEFAULT_AGENT_MAX_CONCURRENT,
  DEFAULT_SUBAGENT_MAX_CONCURRENT,
  resolveAgentMaxConcurrent,
  resolveSubagentMaxConcurrent,
} from "./agent-limits.js";

describe("DEFAULT_AGENT_MAX_CONCURRENT", () => {
  it("should be 4", () => {
    expect(DEFAULT_AGENT_MAX_CONCURRENT).toBe(4);
  });
});

describe("DEFAULT_SUBAGENT_MAX_CONCURRENT", () => {
  it("should be 8", () => {
    expect(DEFAULT_SUBAGENT_MAX_CONCURRENT).toBe(8);
  });
});

describe("resolveAgentMaxConcurrent", () => {
  it("should return default value for undefined config", () => {
    expect(resolveAgentMaxConcurrent(undefined)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents", () => {
    const cfg = {} as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents.defaults", () => {
    const cfg = { agents: {} } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents.defaults.maxConcurrent", () => {
    const cfg = { agents: { defaults: {} } } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for non-number maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: "4" as unknown as number } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for NaN maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: NaN } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for Infinity maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: Infinity } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return default value for -Infinity maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: -Infinity } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(DEFAULT_AGENT_MAX_CONCURRENT);
  });

  it("should return 1 for maxConcurrent value of 0", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: 0 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 1 for negative maxConcurrent value", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: -5 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 1 for maxConcurrent value of 0.5", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: 0.5 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 2 for maxConcurrent value of 1.5", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: 1.5 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return configured value for valid maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: 10 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(10);
  });

  it("should return configured value for decimal maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { maxConcurrent: 5.7 } },
    } as OpenClawConfig;
    expect(resolveAgentMaxConcurrent(cfg)).toBe(5);
  });
});

describe("resolveSubagentMaxConcurrent", () => {
  it("should return default value for undefined config", () => {
    expect(resolveSubagentMaxConcurrent(undefined)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents", () => {
    const cfg = {} as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents.defaults", () => {
    const cfg = { agents: {} } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents.defaults.subagents", () => {
    const cfg = { agents: { defaults: {} } } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for config without agents.defaults.subagents.maxConcurrent", () => {
    const cfg = { agents: { defaults: { subagents: {} } } } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for non-number maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: "8" as unknown as number } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for NaN maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: NaN } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for Infinity maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: Infinity } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return default value for -Infinity maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: -Infinity } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(DEFAULT_SUBAGENT_MAX_CONCURRENT);
  });

  it("should return 1 for maxConcurrent value of 0", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: 0 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 1 for negative maxConcurrent value", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: -5 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 1 for maxConcurrent value of 0.5", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: 0.5 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return 2 for maxConcurrent value of 1.5", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: 1.5 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(1);
  });

  it("should return configured value for valid maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: 16 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(16);
  });

  it("should return configured value for decimal maxConcurrent", () => {
    const cfg = {
      agents: { defaults: { subagents: { maxConcurrent: 10.7 } } },
    } as OpenClawConfig;
    expect(resolveSubagentMaxConcurrent(cfg)).toBe(10);
  });
});
