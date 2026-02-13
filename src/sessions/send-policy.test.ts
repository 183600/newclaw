import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import type { SessionEntry } from "../config/sessions.js";
import { normalizeSendPolicy, resolveSendPolicy } from "./send-policy.js";

describe("normalizeSendPolicy", () => {
  it("normalizes 'allow' to allow", () => {
    expect(normalizeSendPolicy("allow")).toBe("allow");
    expect(normalizeSendPolicy("ALLOW")).toBe("allow");
    expect(normalizeSendPolicy(" Allow ")).toBe("allow");
  });

  it("normalizes 'deny' to deny", () => {
    expect(normalizeSendPolicy("deny")).toBe("deny");
    expect(normalizeSendPolicy("DENY")).toBe("deny");
    expect(normalizeSendPolicy(" Deny ")).toBe("deny");
  });

  it("returns undefined for invalid values", () => {
    expect(normalizeSendPolicy("invalid")).toBeUndefined();
    expect(normalizeSendPolicy("")).toBeUndefined();
    expect(normalizeSendPolicy(null)).toBeUndefined();
    expect(normalizeSendPolicy(undefined)).toBeUndefined();
  });
});

describe("resolveSendPolicy", () => {
  const mockConfig = (policy?: any): OpenClawConfig =>
    ({
      session: {
        sendPolicy: policy,
      },
    }) as OpenClawConfig;

  const mockEntry = (overrides?: Partial<SessionEntry>): SessionEntry =>
    ({
      key: "test-session",
      sendPolicy: undefined,
      channel: undefined,
      chatType: undefined,
      lastChannel: undefined,
      ...overrides,
    }) as SessionEntry;

  describe("entry override", () => {
    it("uses entry sendPolicy when set", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [],
      });
      const entry = mockEntry({ sendPolicy: "allow" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("prioritizes entry override over config rules", () => {
      const cfg = mockConfig({
        default: "allow",
        rules: [
          {
            action: "deny",
            match: { channel: "discord" },
          },
        ],
      });
      const entry = mockEntry({ sendPolicy: "allow", channel: "discord" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });
  });

  describe("default behavior", () => {
    it("allows when no policy configured", () => {
      const cfg = mockConfig();
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("uses policy default when no rules match", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "discord" },
          },
        ],
      });
      const entry = mockEntry({ channel: "slack" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("deny");
    });

    it("defaults to allow when no default specified", () => {
      const cfg = mockConfig({
        rules: [],
      });
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });
  });

  describe("rule matching", () => {
    it("matches by channel", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "discord" },
          },
        ],
      });
      const entry = mockEntry({ channel: "discord" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("matches by chatType", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { chatType: "group" },
          },
        ],
      });
      const entry = mockEntry({ chatType: "group" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("matches by keyPrefix", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { keyPrefix: "discord:group:" },
          },
        ],
      });
      const entry = mockEntry();
      const sessionKey = "discord:group:123456";

      const result = resolveSendPolicy({ cfg, entry, sessionKey });
      expect(result).toBe("allow");
    });

    it("matches multiple criteria", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "discord", chatType: "group" },
          },
        ],
      });
      const entry = mockEntry({ channel: "discord", chatType: "group" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("denies when deny rule matches", () => {
      const cfg = mockConfig({
        default: "allow",
        rules: [
          {
            action: "deny",
            match: { channel: "discord" },
          },
        ],
      });
      const entry = mockEntry({ channel: "discord" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("deny");
    });

    it("denies on first matching deny rule", () => {
      const cfg = mockConfig({
        default: "allow",
        rules: [
          {
            action: "deny",
            match: { channel: "discord" },
          },
          {
            action: "allow",
            match: { channel: "discord", chatType: "group" },
          },
        ],
      });
      const entry = mockEntry({ channel: "discord", chatType: "group" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("deny");
    });

    it("case insensitive matching", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "Discord" },
          },
        ],
      });
      const entry = mockEntry({ channel: "DISCORD" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });
  });

  describe("parameter precedence", () => {
    it("uses explicit channel over entry channel", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "slack" },
          },
        ],
      });
      const entry = mockEntry({ channel: "discord" });

      const result = resolveSendPolicy({ cfg, entry, channel: "slack" });
      expect(result).toBe("allow");
    });

    it("uses explicit chatType over entry chatType", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { chatType: "group" },
          },
        ],
      });
      const entry = mockEntry({ chatType: "dm" });

      const result = resolveSendPolicy({ cfg, entry, chatType: "group" });
      expect(result).toBe("allow");
    });

    it("falls back to lastChannel when channel not set", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "telegram" },
          },
        ],
      });
      const entry = mockEntry({ lastChannel: "telegram" });

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("derives channel from session key", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { channel: "discord" },
          },
        ],
      });
      const entry = mockEntry();
      const sessionKey = "discord:channel:123456";

      const result = resolveSendPolicy({ cfg, entry, sessionKey });
      expect(result).toBe("allow");
    });

    it("derives chatType from session key", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: { chatType: "channel" },
          },
        ],
      });
      const entry = mockEntry();
      const sessionKey = "discord:channel:123456";

      const result = resolveSendPolicy({ cfg, entry, sessionKey });
      expect(result).toBe("allow");
    });
  });

  describe("complex scenarios", () => {
    it("handles empty rules array", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [],
      });
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("deny");
    });

    it("handles undefined rule", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [null, undefined, { action: "allow" }],
      });
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("handles rule without match", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
          },
        ],
      });
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });

    it("handles rule with empty match", () => {
      const cfg = mockConfig({
        default: "deny",
        rules: [
          {
            action: "allow",
            match: {},
          },
        ],
      });
      const entry = mockEntry();

      const result = resolveSendPolicy({ cfg, entry });
      expect(result).toBe("allow");
    });
  });
});
