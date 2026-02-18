import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { OpenClawConfig } from "./types.js";
import {
  applyMessageDefaults,
  applySessionDefaults,
  applyTalkApiKey,
  applyModelDefaults,
  applyAgentDefaults,
  applyLoggingDefaults,
  applyCompactionDefaults,
  resetSessionDefaultsWarningForTests,
} from "./defaults.js";

describe("applyMessageDefaults", () => {
  it("should set default ackReactionScope when not present", () => {
    const config = {} as OpenClawConfig;
    const result = applyMessageDefaults(config);

    expect(result.messages?.ackReactionScope).toBe("group-mentions");
  });

  it("should preserve existing ackReactionScope", () => {
    const config = {
      messages: { ackReactionScope: "all" },
    } as OpenClawConfig;
    const result = applyMessageDefaults(config);

    expect(result.messages?.ackReactionScope).toBe("all");
  });

  it("should preserve other message settings", () => {
    const config = {
      messages: {
        format: "markdown",
        maxLength: 1000,
      },
    } as OpenClawConfig;
    const result = applyMessageDefaults(config);

    expect(result.messages?.format).toBe("markdown");
    expect(result.messages?.maxLength).toBe(1000);
    expect(result.messages?.ackReactionScope).toBe("group-mentions");
  });
});

describe("applySessionDefaults", () => {
  let mockWarn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockWarn = vi.fn();
    resetSessionDefaultsWarningForTests();
  });

  it("should ignore session.mainKey and always set to 'main'", () => {
    const config = {
      session: { mainKey: "custom" },
    } as OpenClawConfig;
    const result = applySessionDefaults(config, { warn: mockWarn });

    expect(result.session?.mainKey).toBe("main");
    expect(mockWarn).toHaveBeenCalledWith(
      'session.mainKey is ignored; main session is always "main".',
    );
  });

  it("should not warn when mainKey is already 'main'", () => {
    const config = {
      session: { mainKey: "main" },
    } as OpenClawConfig;
    const result = applySessionDefaults(config, { warn: mockWarn });

    expect(result.session?.mainKey).toBe("main");
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("should not modify config when session is undefined", () => {
    const config = {} as OpenClawConfig;
    const result = applySessionDefaults(config, { warn: mockWarn });

    expect(result).toBe(config);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("should not modify config when session.mainKey is undefined", () => {
    const config = {
      session: {},
    } as OpenClawConfig;
    const result = applySessionDefaults(config, { warn: mockWarn });

    expect(result).toBe(config);
    expect(mockWarn).not.toHaveBeenCalled();
  });
});

describe("applyTalkApiKey", () => {
  beforeEach(() => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should add talk API key when env var is set", () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-api-key");

    const config = {} as OpenClawConfig;
    const result = applyTalkApiKey(config);

    expect(result.talk?.apiKey).toBe("test-api-key");
  });

  it("should not override existing talk API key", () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "env-key");

    const config = {
      talk: { apiKey: "existing-key" },
    } as OpenClawConfig;
    const result = applyTalkApiKey(config);

    expect(result.talk?.apiKey).toBe("existing-key");
  });

  it("should not modify config when no env var and no existing key", () => {
    const config = {} as OpenClawConfig;
    const result = applyTalkApiKey(config);

    expect(result.talk).toBeUndefined();
  });
});

describe("applyAgentDefaults", () => {
  it("should set default maxConcurrent when not present", () => {
    const config = {
      agents: { defaults: {} },
    } as OpenClawConfig;
    const result = applyAgentDefaults(config);

    expect(result.agents?.defaults?.maxConcurrent).toBeDefined();
    expect(typeof result.agents?.defaults?.maxConcurrent).toBe("number");
  });

  it("should set default subagent maxConcurrent when not present", () => {
    const config = {
      agents: { defaults: {} },
    } as OpenClawConfig;
    const result = applyAgentDefaults(config);

    expect(result.agents?.defaults?.subagents?.maxConcurrent).toBeDefined();
    expect(typeof result.agents?.defaults?.subagents?.maxConcurrent).toBe("number");
  });

  it("should preserve existing maxConcurrent values", () => {
    const config = {
      agents: {
        defaults: {
          maxConcurrent: 10,
          subagents: { maxConcurrent: 5 },
        },
      },
    } as OpenClawConfig;
    const result = applyAgentDefaults(config);

    expect(result.agents?.defaults?.maxConcurrent).toBe(10);
    expect(result.agents?.defaults?.subagents?.maxConcurrent).toBe(5);
  });

  it("should create agents.defaults when agents is undefined", () => {
    const config = {} as OpenClawConfig;
    const result = applyAgentDefaults(config);

    expect(result).not.toBe(config);
    expect(result.agents?.defaults?.maxConcurrent).toBeDefined();
    expect(result.agents?.defaults?.subagents?.maxConcurrent).toBeDefined();
  });
});

describe("applyLoggingDefaults", () => {
  it("should set redactSensitive to 'tools' when not present", () => {
    const config = {
      logging: {},
    } as OpenClawConfig;
    const result = applyLoggingDefaults(config);

    expect(result.logging?.redactSensitive).toBe("tools");
  });

  it("should preserve existing redactSensitive setting", () => {
    const config = {
      logging: { redactSensitive: "all" },
    } as OpenClawConfig;
    const result = applyLoggingDefaults(config);

    expect(result.logging?.redactSensitive).toBe("all");
  });

  it("should not modify config when logging is undefined", () => {
    const config = {} as OpenClawConfig;
    const result = applyLoggingDefaults(config);

    expect(result).toBe(config);
  });
});

describe("applyCompactionDefaults", () => {
  it("should set compaction mode to 'safeguard' when not present", () => {
    const config = {
      agents: { defaults: {} },
    } as OpenClawConfig;
    const result = applyCompactionDefaults(config);

    expect(result.agents?.defaults?.compaction?.mode).toBe("safeguard");
  });

  it("should preserve existing compaction mode", () => {
    const config = {
      agents: {
        defaults: {
          compaction: { mode: "aggressive" },
        },
      },
    } as OpenClawConfig;
    const result = applyCompactionDefaults(config);

    expect(result.agents?.defaults?.compaction?.mode).toBe("aggressive");
  });

  it("should not modify config when agents.defaults is undefined", () => {
    const config = { agents: {} } as OpenClawConfig;
    const result = applyCompactionDefaults(config);

    expect(result).toBe(config);
  });
});

describe("applyModelDefaults", () => {
  it("should apply default values to model definitions", () => {
    const config = {
      models: {
        providers: {
          "test-provider": {
            models: [{ id: "test-model", name: "Test Model" }],
          },
        },
      },
    } as OpenClawConfig;
    const result = applyModelDefaults(config);

    const model = result.models?.providers?.["test-provider"]?.models?.[0];
    expect(model?.reasoning).toBe(false);
    expect(model?.input).toEqual(["text"]);
    expect(model?.cost).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(model?.contextWindow).toBeGreaterThan(0);
    expect(model?.maxTokens).toBeGreaterThan(0);
  });

  it("should preserve existing model values", () => {
    const config = {
      models: {
        providers: {
          "test-provider": {
            models: [
              {
                id: "test-model",
                name: "Test Model",
                reasoning: true,
                input: ["text", "image"],
                cost: { input: 1, output: 2, cacheRead: 0.5, cacheWrite: 0.25 },
                contextWindow: 4096,
                maxTokens: 2048,
              },
            ],
          },
        },
      },
    } as OpenClawConfig;
    const result = applyModelDefaults(config);

    const model = result.models?.providers?.["test-provider"]?.models?.[0];
    expect(model?.reasoning).toBe(true);
    expect(model?.input).toEqual(["text", "image"]);
    expect(model?.cost).toEqual({ input: 1, output: 2, cacheRead: 0.5, cacheWrite: 0.25 });
    expect(model?.contextWindow).toBe(4096);
    expect(model?.maxTokens).toBe(2048);
  });

  it("should not modify config when models is undefined", () => {
    const config = {} as OpenClawConfig;
    const result = applyModelDefaults(config);

    expect(result).toBe(config);
  });
});
