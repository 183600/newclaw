import { describe, expect, it } from "vitest";
import type { SessionEntry, SessionChatType } from "./config/sessions.js";
import type { OpenClawConfig } from "./config/types.js";
import { normalizeSendPolicy, resolveSendPolicy } from "./sessions/send-policy.js";

describe("sessions send-policy", () => {
  describe("normalizeSendPolicy", () => {
    it("normalizes valid policy values", () => {
      expect(normalizeSendPolicy("allow")).toBe("allow");
      expect(normalizeSendPolicy("ALLOW")).toBe("allow");
      expect(normalizeSendPolicy("Allow")).toBe("allow");
      expect(normalizeSendPolicy("deny")).toBe("deny");
      expect(normalizeSendPolicy("DENY")).toBe("deny");
      expect(normalizeSendPolicy("Deny")).toBe("deny");
    });

    it("handles whitespace", () => {
      expect(normalizeSendPolicy("  allow  ")).toBe("allow");
      expect(normalizeSendPolicy("\tdeny\n")).toBe("deny");
    });

    it("returns undefined for invalid values", () => {
      expect(normalizeSendPolicy("")).toBeUndefined();
      expect(normalizeSendPolicy("invalid")).toBeUndefined();
      expect(normalizeSendPolicy("enabled")).toBeUndefined();
      expect(normalizeSendPolicy("disabled")).toBeUndefined();
      expect(normalizeSendPolicy(null)).toBeUndefined();
      expect(normalizeSendPolicy(undefined)).toBeUndefined();
    });
  });

  describe("resolveSendPolicy", () => {
    const createMockConfig = (sessionPolicy?: unknown): OpenClawConfig =>
      ({
        session: { sendPolicy: sessionPolicy },
      }) as OpenClawConfig;

    const createMockEntry = (
      sendPolicy?: string,
      channel?: string,
      chatType?: SessionChatType,
    ): SessionEntry =>
      ({
        id: "test-session",
        createdAt: new Date().toISOString(),
        sendPolicy,
        channel,
        chatType,
      }) as SessionEntry;

    describe("entry override", () => {
      it("uses entry sendPolicy when set", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow" }],
        });
        const entry = createMockEntry("allow");

        const result = resolveSendPolicy({ cfg, entry });
        expect(result).toBe("allow");
      });

      it("uses entry sendPolicy even when it denies", () => {
        const cfg = createMockConfig({
          default: "allow",
          rules: [{ action: "allow" }],
        });
        const entry = createMockEntry("deny");

        const result = resolveSendPolicy({ cfg, entry });
        expect(result).toBe("deny");
      });
    });

    describe("no policy configured", () => {
      it("allows by default when no policy", () => {
        const cfg = createMockConfig();
        const result = resolveSendPolicy({ cfg });
        expect(result).toBe("allow");
      });

      it("allows by default when policy has no rules", () => {
        const cfg = createMockConfig({});
        const result = resolveSendPolicy({ cfg });
        expect(result).toBe("allow");
      });

      it("allows by default when policy has empty rules", () => {
        const cfg = createMockConfig({ rules: [] });
        const result = resolveSendPolicy({ cfg });
        expect(result).toBe("allow");
      });
    });

    describe("policy default", () => {
      it("uses policy default when no rules match", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "discord" } }],
        });

        const result = resolveSendPolicy({ cfg, channel: "telegram" });
        expect(result).toBe("deny");
      });

      it("uses policy default when default is allow", () => {
        const cfg = createMockConfig({
          default: "allow",
          rules: [{ action: "deny", match: { channel: "discord" } }],
        });

        const result = resolveSendPolicy({ cfg, channel: "telegram" });
        expect(result).toBe("allow");
      });

      it("allows by default when no default is specified", () => {
        const cfg = createMockConfig({
          rules: [{ action: "deny", match: { channel: "discord" } }],
        });

        const result = resolveSendPolicy({ cfg, channel: "telegram" });
        expect(result).toBe("allow");
      });
    });

    describe("rule matching", () => {
      it("matches by channel", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "allow", match: { channel: "telegram" } },
            { action: "deny", match: { channel: "discord" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, channel: "discord" })).toBe("deny");
        expect(resolveSendPolicy({ cfg, channel: "slack" })).toBe("deny"); // default
      });

      it("matches by chatType", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "allow", match: { chatType: "dm" } },
            { action: "deny", match: { chatType: "group" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, chatType: "dm" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, chatType: "group" })).toBe("deny");
        expect(resolveSendPolicy({ cfg, chatType: "channel" })).toBe("deny"); // default
      });

      it("matches by session key prefix", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "allow", match: { keyPrefix: "telegram:user123:" } },
            { action: "deny", match: { keyPrefix: "telegram:user456:" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:dm" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user456:dm" })).toBe("deny");
        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user789:dm" })).toBe("deny"); // default
      });

      it("matches multiple criteria", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            {
              action: "allow",
              match: {
                channel: "telegram",
                chatType: "dm",
                keyPrefix: "telegram:user123:",
              },
            },
            {
              action: "deny",
              match: {
                channel: "telegram",
                chatType: "group",
              },
            },
          ],
        });

        // All criteria match
        expect(
          resolveSendPolicy({
            cfg,
            channel: "telegram",
            chatType: "dm",
            sessionKey: "telegram:user123:dm",
          }),
        ).toBe("allow");

        // Only channel and chatType match
        expect(
          resolveSendPolicy({
            cfg,
            channel: "telegram",
            chatType: "dm",
            sessionKey: "telegram:user456:dm",
          }),
        ).toBe("deny"); // default

        // Only channel matches
        expect(
          resolveSendPolicy({
            cfg,
            channel: "telegram",
            chatType: "group",
            sessionKey: "telegram:user123:group",
          }),
        ).toBe("deny");
      });

      it("handles case insensitive matching", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "TELEGRAM" } }],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, channel: "TELEGRAM" })).toBe("allow");
      });

      it("handles whitespace in matching values", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "  telegram  " } }],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("allow");
      });
    });

    describe("rule precedence", () => {
      it("deny rules take precedence over allow rules", () => {
        const cfg = createMockConfig({
          default: "allow",
          rules: [
            { action: "allow", match: { channel: "telegram" } },
            { action: "deny", match: { channel: "telegram" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("deny");
      });

      it("first matching rule determines outcome", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "deny", match: { channel: "telegram" } },
            { action: "allow", match: { channel: "telegram" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("deny");
      });
    });

    describe("parameter resolution", () => {
      it("derives channel from session key", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "telegram" } }],
        });

        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:dm" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:group" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, sessionKey: "discord:user123:dm" })).toBe("deny");
      });

      it("derives chat type from session key", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "allow", match: { chatType: "dm" } },
            { action: "deny", match: { chatType: "group" } },
          ],
        });

        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:dm" })).toBe("allow");
        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:group" })).toBe("deny");
        expect(resolveSendPolicy({ cfg, sessionKey: "telegram:user123:channel" })).toBe("deny"); // default
      });

      it("uses entry channel when no channel parameter", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "telegram" } }],
        });
        const entry = createMockEntry(undefined, "telegram");

        expect(resolveSendPolicy({ cfg, entry })).toBe("allow");
      });

      it("uses entry lastChannel when no channel parameter", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { channel: "telegram" } }],
        });
        const entry = createMockEntry(undefined, undefined, undefined);
        (entry as { lastChannel?: string }).lastChannel = "telegram";

        expect(resolveSendPolicy({ cfg, entry })).toBe("allow");
      });

      it("uses entry chatType when no chatType parameter", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { chatType: "dm" } }],
        });
        const entry = createMockEntry(undefined, undefined, "dm");

        expect(resolveSendPolicy({ cfg, entry })).toBe("allow");
      });

      it("prioritizes parameters over entry values", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            { action: "allow", match: { channel: "telegram" } },
            { action: "deny", match: { channel: "discord" } },
          ],
        });
        const entry = createMockEntry(undefined, "discord");

        expect(resolveSendPolicy({ cfg, entry, channel: "telegram" })).toBe("allow");
      });
    });

    describe("edge cases", () => {
      it("handles invalid rules", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [
            null,
            undefined,
            {},
            { action: "allow" }, // missing match
            { match: { channel: "telegram" } }, // missing action
          ],
        });

        expect(resolveSendPolicy({ cfg, channel: "telegram" })).toBe("allow"); // global allow rule matches
      });

      it("handles empty session key", () => {
        const cfg = createMockConfig({
          default: "deny",
          rules: [{ action: "allow", match: { keyPrefix: "telegram:" } }],
        });

        expect(resolveSendPolicy({ cfg, sessionKey: "" })).toBe("deny"); // default
      });

      it("handles null/undefined parameters", () => {
        const cfg = createMockConfig({
          default: "allow",
          rules: [],
        });

        expect(resolveSendPolicy({ cfg })).toBe("allow");
      });
    });
  });
});
