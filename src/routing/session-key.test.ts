import { describe, expect, it } from "vitest";
import {
  buildAgentMainSessionKey,
  buildAgentPeerSessionKey,
  buildGroupHistoryKey,
  normalizeAccountId,
  normalizeAgentId,
  normalizeMainKey,
  resolveAgentIdFromSessionKey,
  resolveThreadSessionKeys,
  sanitizeAgentId,
  toAgentRequestSessionKey,
  toAgentStoreSessionKey,
  DEFAULT_ACCOUNT_ID,
  DEFAULT_AGENT_ID,
  DEFAULT_MAIN_KEY,
} from "./session-key.js";

describe("routing/session-key", () => {
  describe("normalizeMainKey", () => {
    it("returns default for empty input", () => {
      expect(normalizeMainKey("")).toBe(DEFAULT_MAIN_KEY);
      expect(normalizeMainKey(null as any)).toBe(DEFAULT_MAIN_KEY);
      expect(normalizeMainKey(undefined as any)).toBe(DEFAULT_MAIN_KEY);
    });

    it("trims and lowercases input", () => {
      expect(normalizeMainKey("  TestKey  ")).toBe("testkey");
      expect(normalizeMainKey("TESTKEY")).toBe("testkey");
    });

    it("preserves valid input", () => {
      expect(normalizeMainKey("my-key")).toBe("my-key");
    });
  });

  describe("normalizeAgentId", () => {
    it("returns default for empty input", () => {
      expect(normalizeAgentId("")).toBe(DEFAULT_AGENT_ID);
      expect(normalizeAgentId(null as any)).toBe(DEFAULT_AGENT_ID);
      expect(normalizeAgentId(undefined as any)).toBe(DEFAULT_AGENT_ID);
    });

    it("accepts valid IDs", () => {
      expect(normalizeAgentId("valid123")).toBe("valid123");
      expect(normalizeAgentId("valid_name")).toBe("valid_name");
      expect(normalizeAgentId("valid-name")).toBe("valid-name");
    });

    it("sanitizes invalid IDs", () => {
      expect(normalizeAgentId("Invalid@Name")).toBe("invalid-name");
      expect(normalizeAgentId("  spaced name  ")).toBe("spaced-name");
      expect(normalizeAgentId("name@with@many@symbols")).toBe("name-with-many-symbols");
    });

    it("removes leading/trailing dashes", () => {
      expect(normalizeAgentId("-name")).toBe("name");
      // "name-" is valid according to VALID_ID_RE, so it stays as "name-"
      expect(normalizeAgentId("name-")).toBe("name-");
      // "-name-" has leading dash, so it gets processed, removing both leading and trailing dashes
      expect(normalizeAgentId("-name-")).toBe("name");
    });

    it("limits to 64 characters", () => {
      const longId = "a".repeat(100);
      expect(normalizeAgentId(longId)).toBe("a".repeat(64));
    });

    it("handles all invalid characters", () => {
      expect(normalizeAgentId("@@@")).toBe(DEFAULT_AGENT_ID);
    });
  });

  describe("sanitizeAgentId", () => {
    it("behaves same as normalizeAgentId", () => {
      const testCases = [
        "",
        null,
        undefined,
        "valid123",
        "Invalid@Name",
        "-name-",
        "a".repeat(100),
        "@@@",
      ];

      testCases.forEach((testCase) => {
        expect(sanitizeAgentId(testCase as any)).toBe(normalizeAgentId(testCase as any));
      });
    });
  });

  describe("normalizeAccountId", () => {
    it("returns default for empty input", () => {
      expect(normalizeAccountId("")).toBe(DEFAULT_ACCOUNT_ID);
      expect(normalizeAccountId(null as any)).toBe(DEFAULT_ACCOUNT_ID);
      expect(normalizeAccountId(undefined as any)).toBe(DEFAULT_ACCOUNT_ID);
    });

    it("accepts valid IDs", () => {
      expect(normalizeAccountId("valid123")).toBe("valid123");
      expect(normalizeAccountId("valid_name")).toBe("valid_name");
    });

    it("sanitizes invalid IDs", () => {
      expect(normalizeAccountId("Invalid@Name")).toBe("invalid-name");
      expect(normalizeAccountId("  spaced name  ")).toBe("spaced-name");
    });
  });

  describe("toAgentRequestSessionKey", () => {
    it("returns undefined for empty input", () => {
      expect(toAgentRequestSessionKey("")).toBeUndefined();
      expect(toAgentRequestSessionKey(null as any)).toBeUndefined();
      expect(toAgentRequestSessionKey(undefined as any)).toBeUndefined();
    });

    it("returns rest part for valid agent session key", () => {
      expect(toAgentRequestSessionKey("agent:myagent:main")).toBe("main");
      expect(toAgentRequestSessionKey("agent:myagent:some:rest")).toBe("some:rest");
    });

    it("returns original for non-agent session key", () => {
      expect(toAgentRequestSessionKey("main")).toBe("main");
      expect(toAgentRequestSessionKey("some:key")).toBe("some:key");
    });

    it("trims whitespace", () => {
      expect(toAgentRequestSessionKey("  agent:myagent:main  ")).toBe("main");
    });
  });

  describe("toAgentStoreSessionKey", () => {
    it("builds agent main session key for main request", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "main",
      });
      expect(result).toBe("agent:myagent:main");
    });

    it("builds agent main session key for empty request", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "",
      });
      expect(result).toBe("agent:myagent:main");
    });

    it("preserves agent: prefix", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "agent:custom:key",
      });
      expect(result).toBe("agent:custom:key");
    });

    it("adds agent: prefix to subagent", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "subagent:custom",
      });
      expect(result).toBe("agent:myagent:subagent:custom");
    });

    it("adds agent: prefix to custom keys", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "custom:key",
      });
      expect(result).toBe("agent:myagent:custom:key");
    });

    it("uses custom main key", () => {
      const result = toAgentStoreSessionKey({
        agentId: "myagent",
        requestKey: "",
        mainKey: "custom-main",
      });
      expect(result).toBe("agent:myagent:custom-main");
    });

    it("normalizes agent ID", () => {
      const result = toAgentStoreSessionKey({
        agentId: "My@Agent",
        requestKey: "custom",
      });
      expect(result).toBe("agent:my-agent:custom");
    });
  });

  describe("resolveAgentIdFromSessionKey", () => {
    it("returns default for empty session key", () => {
      expect(resolveAgentIdFromSessionKey("")).toBe(DEFAULT_AGENT_ID);
      expect(resolveAgentIdFromSessionKey(null as any)).toBe(DEFAULT_AGENT_ID);
      expect(resolveAgentIdFromSessionKey(undefined as any)).toBe(DEFAULT_AGENT_ID);
    });

    it("extracts agent ID from valid session key", () => {
      expect(resolveAgentIdFromSessionKey("agent:myagent:main")).toBe("myagent");
      expect(resolveAgentIdFromSessionKey("agent:myagent:some:rest")).toBe("myagent");
    });

    it("returns default for invalid session key", () => {
      expect(resolveAgentIdFromSessionKey("invalid")).toBe(DEFAULT_AGENT_ID);
      expect(resolveAgentIdFromSessionKey("notagent:myagent:main")).toBe(DEFAULT_AGENT_ID);
    });

    it("normalizes extracted agent ID", () => {
      expect(resolveAgentIdFromSessionKey("agent:My@Agent:main")).toBe("my-agent");
    });
  });

  describe("buildAgentMainSessionKey", () => {
    it("builds basic session key", () => {
      const result = buildAgentMainSessionKey({
        agentId: "myagent",
      });
      expect(result).toBe("agent:myagent:main");
    });

    it("uses custom main key", () => {
      const result = buildAgentMainSessionKey({
        agentId: "myagent",
        mainKey: "custom",
      });
      expect(result).toBe("agent:myagent:custom");
    });

    it("normalizes agent ID and main key", () => {
      const result = buildAgentMainSessionKey({
        agentId: "My@Agent",
        mainKey: "  Custom@Key  ",
      });
      // normalizeMainKey only lowercases, doesn't replace invalid characters
      expect(result).toBe("agent:my-agent:custom@key");
    });
  });

  describe("buildAgentPeerSessionKey", () => {
    it("builds DM session key with main scope", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "main",
      });
      expect(result).toBe("agent:myagent:main");
    });

    it("builds DM session key with per-peer scope", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "per-peer",
      });
      expect(result).toBe("agent:myagent:dm:user123");
    });

    it("builds DM session key with per-channel-peer scope", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "per-channel-peer",
      });
      expect(result).toBe("agent:myagent:discord:dm:user123");
    });

    it("builds DM session key with per-account-channel-peer scope", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "per-account-channel-peer",
      });
      expect(result).toBe("agent:myagent:discord:account1:dm:user123");
    });

    it("builds group session key", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "group",
        peerId: "group123",
      });
      expect(result).toBe("agent:myagent:discord:group:group123");
    });

    it("builds channel session key", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "slack",
        accountId: "account1",
        peerKind: "channel",
        peerId: "channel123",
      });
      expect(result).toBe("agent:myagent:slack:channel:channel123");
    });

    it("uses unknown for missing channel", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "",
        accountId: "account1",
        peerKind: "group",
        peerId: "group123",
      });
      expect(result).toBe("agent:myagent:unknown:group:group123");
    });

    it("uses unknown for missing peer ID", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "group",
        peerId: "",
      });
      expect(result).toBe("agent:myagent:discord:group:unknown");
    });

    it("resolves linked peer ID", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "per-peer",
        identityLinks: {
          canonical: ["user123", "user456"],
        },
      });
      expect(result).toBe("agent:myagent:dm:canonical");
    });

    it("resolves scoped linked peer ID", () => {
      const result = buildAgentPeerSessionKey({
        agentId: "myagent",
        channel: "discord",
        accountId: "account1",
        peerKind: "dm",
        peerId: "user123",
        dmScope: "per-channel-peer",
        identityLinks: {
          canonical: ["discord:user123", "slack:user123"],
        },
      });
      expect(result).toBe("agent:myagent:discord:dm:canonical");
    });
  });

  describe("buildGroupHistoryKey", () => {
    it("builds group history key", () => {
      const result = buildGroupHistoryKey({
        channel: "discord",
        accountId: "account1",
        peerKind: "group",
        peerId: "group123",
      });
      expect(result).toBe("discord:account1:group:group123");
    });

    it("builds channel history key", () => {
      const result = buildGroupHistoryKey({
        channel: "slack",
        accountId: "account1",
        peerKind: "channel",
        peerId: "channel123",
      });
      expect(result).toBe("slack:account1:channel:channel123");
    });

    it("normalizes inputs", () => {
      const result = buildGroupHistoryKey({
        channel: "  Discord  ",
        accountId: "  Account1  ",
        peerKind: "group",
        peerId: "  Group123  ",
      });
      expect(result).toBe("discord:account1:group:group123");
    });

    it("uses defaults for missing values", () => {
      const result = buildGroupHistoryKey({
        channel: "",
        accountId: "",
        peerKind: "group",
        peerId: "",
      });
      expect(result).toBe("unknown:default:group:unknown");
    });
  });

  describe("resolveThreadSessionKeys", () => {
    it("returns base session key when no thread ID", () => {
      const result = resolveThreadSessionKeys({
        baseSessionKey: "agent:myagent:main",
        threadId: "",
      });
      expect(result).toEqual({
        sessionKey: "agent:myagent:main",
        parentSessionKey: undefined,
      });
    });

    it("adds thread suffix when thread ID provided", () => {
      const result = resolveThreadSessionKeys({
        baseSessionKey: "agent:myagent:main",
        threadId: "thread123",
      });
      expect(result).toEqual({
        sessionKey: "agent:myagent:main:thread:thread123",
        parentSessionKey: undefined,
      });
    });

    it("uses parent session key when provided", () => {
      const result = resolveThreadSessionKeys({
        baseSessionKey: "agent:myagent:main",
        threadId: "thread123",
        parentSessionKey: "agent:myagent:parent",
      });
      expect(result).toEqual({
        sessionKey: "agent:myagent:main:thread:thread123",
        parentSessionKey: "agent:myagent:parent",
      });
    });

    it("skips suffix when useSuffix is false", () => {
      const result = resolveThreadSessionKeys({
        baseSessionKey: "agent:myagent:main",
        threadId: "thread123",
        useSuffix: false,
      });
      expect(result).toEqual({
        sessionKey: "agent:myagent:main",
        parentSessionKey: undefined,
      });
    });

    it("normalizes thread ID", () => {
      const result = resolveThreadSessionKeys({
        baseSessionKey: "agent:myagent:main",
        threadId: "  Thread123  ",
      });
      expect(result).toEqual({
        sessionKey: "agent:myagent:main:thread:thread123",
        parentSessionKey: undefined,
      });
    });
  });
});
