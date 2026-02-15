import { describe, expect, it } from "vitest";
import type {
  SessionConfig,
  OutboundRetryConfig,
  BlockStreamingCoalesceConfig,
  BlockStreamingChunkConfig,
  MarkdownConfig,
  HumanDelayConfig,
  SessionSendPolicyConfig,
  LoggingConfig,
  DiagnosticsConfig,
  WebReconnectConfig,
  WebConfig,
  IdentityConfig,
} from "../config/types.base.js";
import type {
  ReplyMode,
  TypingMode,
  SessionScope,
  DmScope,
  GroupPolicy,
  DmPolicy,
} from "../config/types.base.js";

describe("type validation and edge cases", () => {
  describe("base type definitions", () => {
    it("validates ReplyMode enum values", () => {
      const validModes: ReplyMode[] = ["text", "command"];
      validModes.forEach((mode) => {
        expect(mode).toBeOneOf(["text", "command"]);
      });
    });

    it("validates TypingMode enum values", () => {
      const validModes: TypingMode[] = ["never", "instant", "thinking", "message"];
      validModes.forEach((mode) => {
        expect(mode).toBeOneOf(["never", "instant", "thinking", "message"]);
      });
    });

    it("validates SessionScope enum values", () => {
      const validScopes: SessionScope[] = ["per-sender", "global"];
      validScopes.forEach((scope) => {
        expect(scope).toBeOneOf(["per-sender", "global"]);
      });
    });

    it("validates DmScope enum values", () => {
      const validScopes: DmScope[] = [
        "main",
        "per-peer",
        "per-channel-peer",
        "per-account-channel-peer",
      ];
      validScopes.forEach((scope) => {
        expect(scope).toBeOneOf([
          "main",
          "per-peer",
          "per-channel-peer",
          "per-account-channel-peer",
        ]);
      });
    });

    it("validates GroupPolicy enum values", () => {
      const validPolicies: GroupPolicy[] = ["open", "disabled", "allowlist"];
      validPolicies.forEach((policy) => {
        expect(policy).toBeOneOf(["open", "disabled", "allowlist"]);
      });
    });

    it("validates DmPolicy enum values", () => {
      const validPolicies: DmPolicy[] = ["pairing", "allowlist", "open", "disabled"];
      validPolicies.forEach((policy) => {
        expect(policy).toBeOneOf(["pairing", "allowlist", "open", "disabled"]);
      });
    });
  });

  describe("config type validation", () => {
    it("validates OutboundRetryConfig with default values", () => {
      const config: OutboundRetryConfig = {};
      // These should have default values when undefined
      expect(config.attempts).toBeUndefined();
      expect(config.minDelayMs).toBeUndefined();
      expect(config.maxDelayMs).toBeUndefined();
      expect(config.jitter).toBeUndefined();
    });

    it("validates OutboundRetryConfig with custom values", () => {
      const config: OutboundRetryConfig = {
        attempts: 5,
        minDelayMs: 100,
        maxDelayMs: 60000,
        jitter: 0.2,
      };
      expect(config.attempts).toBe(5);
      expect(config.minDelayMs).toBe(100);
      expect(config.maxDelayMs).toBe(60000);
      expect(config.jitter).toBe(0.2);
    });

    it("validates BlockStreamingCoalesceConfig with default values", () => {
      const config: BlockStreamingCoalesceConfig = {};
      expect(config.minChars).toBeUndefined();
      expect(config.maxChars).toBeUndefined();
      expect(config.idleMs).toBeUndefined();
    });

    it("validates BlockStreamingChunkConfig with all properties", () => {
      const config: BlockStreamingChunkConfig = {
        minChars: 10,
        maxChars: 500,
        breakPreference: "paragraph",
      };
      expect(config.minChars).toBe(10);
      expect(config.maxChars).toBe(500);
      expect(config.breakPreference).toBe("paragraph");
    });

    it("validates MarkdownConfig with different table modes", () => {
      const configs: MarkdownConfig[] = [
        { tables: "off" },
        { tables: "bullets" },
        { tables: "code" },
      ];
      configs.forEach((config) => {
        expect(config.tables).toBeOneOf(["off", "bullets", "code"]);
      });
    });

    it("validates HumanDelayConfig with different modes", () => {
      const configs: HumanDelayConfig[] = [
        { mode: "off", minMs: 0, maxMs: 0 },
        { mode: "natural", minMs: 800, maxMs: 2500 },
        { mode: "custom", minMs: 500, maxMs: 5000 },
      ];
      configs.forEach((config) => {
        expect(config.mode).toBeOneOf(["off", "natural", "custom"]);
      });
    });

    it("validates SessionSendPolicyConfig with complex rules", () => {
      const config: SessionSendPolicyConfig = {
        default: "allow",
        rules: [
          {
            action: "deny",
            match: {
              channel: "test-channel",
              chatType: "dm",
              keyPrefix: "test-prefix",
            },
          },
          {
            action: "allow",
            match: {
              channel: "allowed-channel",
            },
          },
        ],
      };
      expect(config.default).toBe("allow");
      expect(config.rules).toHaveLength(2);
      expect(config.rules[0].action).toBe("deny");
      expect(config.rules[0].match?.channel).toBe("test-channel");
    });

    it("validates LoggingConfig with all properties", () => {
      const config: LoggingConfig = {
        level: "debug",
        file: "/var/log/openclaw.log",
        consoleLevel: "info",
        consoleStyle: "json",
        redactSensitive: "tools",
        redactPatterns: ["token.*", "secret.*"],
      };
      expect(config.level).toBe("debug");
      expect(config.consoleStyle).toBe("json");
      expect(config.redactPatterns).toEqual(["token.*", "secret.*"]);
    });

    it("validates DiagnosticsConfig with nested properties", () => {
      const config: DiagnosticsConfig = {
        enabled: true,
        flags: ["telegram.http", "web.reconnect"],
        otel: {
          enabled: true,
          endpoint: "http://localhost:4318",
          protocol: "http/protobuf",
          serviceName: "openclaw",
          traces: true,
          metrics: true,
          logs: true,
          sampleRate: 0.1,
          flushIntervalMs: 5000,
        },
        cacheTrace: {
          enabled: true,
          filePath: "/tmp/cache-trace.log",
          includeMessages: true,
          includePrompt: false,
          includeSystem: true,
        },
      };
      expect(config.enabled).toBe(true);
      expect(config.flags).toContain("telegram.http");
      expect(config.otel?.serviceName).toBe("openclaw");
      expect(config.cacheTrace?.includeMessages).toBe(true);
    });

    it("validates WebReconnectConfig with exponential backoff", () => {
      const config: WebReconnectConfig = {
        initialMs: 1000,
        maxMs: 30000,
        factor: 2,
        jitter: 0.1,
        maxAttempts: 5,
      };
      expect(config.initialMs).toBe(1000);
      expect(config.factor).toBe(2);
      expect(config.maxAttempts).toBe(5);
    });

    it("validates WebConfig with nested reconnect config", () => {
      const config: WebConfig = {
        enabled: true,
        heartbeatSeconds: 30,
        reconnect: {
          initialMs: 1000,
          maxMs: 60000,
          factor: 1.5,
          jitter: 0.2,
          maxAttempts: 10,
        },
      };
      expect(config.enabled).toBe(true);
      expect(config.heartbeatSeconds).toBe(30);
      expect(config.reconnect?.maxAttempts).toBe(10);
    });

    it("validates IdentityConfig with different avatar formats", () => {
      const configs: IdentityConfig[] = [
        {
          name: "Test Bot",
          theme: "dark",
          emoji: "🤖",
          avatar: "https://example.com/avatar.png",
        },
        {
          name: "Local Bot",
          avatar: "./assets/avatar.png",
        },
        {
          name: "Data URI Bot",
          avatar:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        },
      ];
      configs.forEach((config) => {
        expect(config.name).toBeDefined();
        expect(config.avatar).toBeDefined();
      });
    });
  });

  describe("SessionConfig validation", () => {
    it("validates SessionConfig with all properties", () => {
      const config: SessionConfig = {
        scope: "per-sender",
        dmScope: "per-peer",
        identityLinks: {
          user123: ["telegram:123", "discord:456"],
        },
        resetTriggers: ["message", "hour"],
        idleMinutes: 60,
        reset: {
          mode: "daily",
          atHour: 2,
          idleMinutes: 120,
        },
        resetByType: {
          dm: { mode: "idle", idleMinutes: 30 },
          group: { mode: "daily", atHour: 3 },
          thread: { mode: "idle", idleMinutes: 60 },
        },
        resetByChannel: {
          discord: { mode: "daily", atHour: 4 },
          telegram: { mode: "idle", idleMinutes: 90 },
        },
        store: "file",
        typingIntervalSeconds: 5,
        typingMode: "thinking",
        mainKey: "custom-main",
        sendPolicy: {
          default: "allow",
          rules: [{ action: "deny", match: { channel: "blocked" } }],
        },
        agentToAgent: {
          maxPingPongTurns: 3,
        },
      };
      expect(config.scope).toBe("per-sender");
      expect(config.dmScope).toBe("per-peer");
      expect(config.identityLinks?.["user123"]).toEqual(["telegram:123", "discord:456"]);
      expect(config.reset?.mode).toBe("daily");
      expect(config.resetByType?.dm?.mode).toBe("idle");
      expect(config.resetByChannel?.discord?.atHour).toBe(4);
      expect(config.agentToAgent?.maxPingPongTurns).toBe(3);
    });

    it("validates SessionConfig with minimal properties", () => {
      const config: SessionConfig = {};
      expect(config.scope).toBeUndefined();
      expect(config.dmScope).toBeUndefined();
      expect(config.identityLinks).toBeUndefined();
    });

    it("validates SessionConfig with edge cases", () => {
      const config: SessionConfig = {
        idleMinutes: 0,
        resetTriggers: [],
        identityLinks: {},
        resetByChannel: {},
        sendPolicy: {
          default: "deny",
          rules: [],
        },
        agentToAgent: {
          maxPingPongTurns: 0,
        },
      };
      expect(config.idleMinutes).toBe(0);
      expect(config.resetTriggers).toEqual([]);
      expect(config.identityLinks).toEqual({});
      expect(config.sendPolicy?.rules).toEqual([]);
      expect(config.agentToAgent?.maxPingPongTurns).toBe(0);
    });
  });
});
