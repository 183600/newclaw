import { describe, expect, it, vi } from "vitest";
import {
  CHAT_CHANNEL_ORDER,
  CHAT_CHANNEL_ALIASES,
  listChatChannels,
  listChatChannelAliases,
  getChatChannelMeta,
  normalizeChatChannelId,
  normalizeChannelId,
  formatChannelPrimerLine,
  formatChannelSelectionLine,
  DEFAULT_CHAT_CHANNEL,
} from "./registry.js";

describe("Chat Channel Registry", () => {
  describe("CHAT_CHANNEL_ORDER", () => {
    it("contains expected channel IDs", () => {
      expect(CHAT_CHANNEL_ORDER).toContain("telegram");
      expect(CHAT_CHANNEL_ORDER).toContain("whatsapp");
      expect(CHAT_CHANNEL_ORDER).toContain("discord");
      expect(CHAT_CHANNEL_ORDER).toContain("googlechat");
      expect(CHAT_CHANNEL_ORDER).toContain("slack");
      expect(CHAT_CHANNEL_ORDER).toContain("signal");
      expect(CHAT_CHANNEL_ORDER).toContain("imessage");
    });

    it("has whatsapp as default", () => {
      expect(DEFAULT_CHAT_CHANNEL).toBe("whatsapp");
    });
  });

  describe("CHAT_CHANNEL_ALIASES", () => {
    it("contains common aliases", () => {
      expect(CHAT_CHANNEL_ALIASES).toEqual({
        imsg: "imessage",
        "google-chat": "googlechat",
        gchat: "googlechat",
        tg: "telegram",
        dc: "discord",
      });
    });
  });

  describe("listChatChannels", () => {
    it("returns all chat channels in order", () => {
      const channels = listChatChannels();
      expect(channels).toHaveLength(7);
      expect(channels[0].id).toBe("telegram");
      expect(channels[1].id).toBe("whatsapp");
    });

    it("returns channels with required metadata", () => {
      const channels = listChatChannels();
      channels.forEach((channel) => {
        expect(channel).toHaveProperty("id");
        expect(channel).toHaveProperty("label");
        expect(channel).toHaveProperty("docsPath");
        expect(channel).toHaveProperty("blurb");
        expect(channel).toHaveProperty("systemImage");
      });
    });
  });

  describe("listChatChannelAliases", () => {
    it("returns all available aliases", () => {
      const aliases = listChatChannelAliases();
      expect(aliases).toContain("imsg");
      expect(aliases).toContain("gchat");
      expect(aliases).toContain("tg");
      expect(aliases).toContain("dc");
    });
  });

  describe("getChatChannelMeta", () => {
    it("returns correct metadata for telegram", () => {
      const meta = getChatChannelMeta("telegram");
      expect(meta.id).toBe("telegram");
      expect(meta.label).toBe("Telegram");
      expect(meta.selectionLabel).toBe("Telegram (Bot API)");
      expect(meta.detailLabel).toBe("Telegram Bot");
    });

    it("returns correct metadata for whatsapp", () => {
      const meta = getChatChannelMeta("whatsapp");
      expect(meta.id).toBe("whatsapp");
      expect(meta.label).toBe("WhatsApp");
      expect(meta.selectionLabel).toBe("WhatsApp (QR link)");
      expect(meta.detailLabel).toBe("WhatsApp Web");
    });

    it("returns correct metadata for discord", () => {
      const meta = getChatChannelMeta("discord");
      expect(meta.id).toBe("discord");
      expect(meta.label).toBe("Discord");
      expect(meta.systemImage).toBe("bubble.left.and.bubble.right");
    });
  });

  describe("normalizeChatChannelId", () => {
    it("returns null for undefined/null/empty input", () => {
      expect(normalizeChatChannelId(undefined)).toBeNull();
      expect(normalizeChatChannelId(null)).toBeNull();
      expect(normalizeChatChannelId("")).toBeNull();
      expect(normalizeChatChannelId("   ")).toBeNull();
    });

    it("normalizes case and whitespace", () => {
      expect(normalizeChatChannelId("telegram")).toBe("telegram");
      expect(normalizeChatChannelId("TELEGRAM")).toBe("telegram");
      expect(normalizeChatChannelId(" Telegram ")).toBe("telegram");
    });

    it("resolves aliases", () => {
      expect(normalizeChatChannelId("tg")).toBe("telegram");
      expect(normalizeChatChannelId("dc")).toBe("discord");
      expect(normalizeChatChannelId("imsg")).toBe("imessage");
      expect(normalizeChatChannelId("gchat")).toBe("googlechat");
      expect(normalizeChatChannelId("google-chat")).toBe("googlechat");
    });

    it("returns null for invalid channels", () => {
      expect(normalizeChatChannelId("invalid")).toBeNull();
      expect(normalizeChatChannelId("fake-channel")).toBeNull();
    });
  });

  describe("normalizeChannelId", () => {
    it("behaves the same as normalizeChatChannelId", () => {
      const testCases = ["telegram", "tg", "whatsapp", "invalid", undefined, null, ""];

      testCases.forEach((input) => {
        expect(normalizeChannelId(input)).toBe(normalizeChatChannelId(input));
      });
    });
  });

  describe("formatChannelPrimerLine", () => {
    it("formats primer line correctly", () => {
      const telegramMeta = getChatChannelMeta("telegram");
      const primer = formatChannelPrimerLine(telegramMeta);
      expect(primer).toBe(
        "Telegram: simplest way to get started — register a bot with @BotFather and get going.",
      );
    });

    it("handles different channels", () => {
      const discordMeta = getChatChannelMeta("discord");
      const primer = formatChannelPrimerLine(discordMeta);
      expect(primer).toBe("Discord: very well supported right now.");
    });
  });

  describe("formatChannelSelectionLine", () => {
    it("formats selection line with docs link", () => {
      const telegramMeta = getChatChannelMeta("telegram");
      const mockDocsLink = vi.fn((path, label) => `[${label || path}](${path})`);

      const selection = formatChannelSelectionLine(telegramMeta, mockDocsLink);
      expect(selection).toContain("Telegram");
      expect(selection).toContain("simplest way to get started");
      expect(selection).toContain("[/channels/telegram](/channels/telegram)");
      expect(selection).toContain("https://openclaw.ai");
      expect(selection).not.toContain("Docs:"); // telegram has selectionDocsOmitLabel: true
    });

    it("handles channels without selection extras", () => {
      const discordMeta = getChatChannelMeta("discord");
      const mockDocsLink = vi.fn((path, label) => `[${label || path}](${path})`);

      const selection = formatChannelSelectionLine(discordMeta, mockDocsLink);
      expect(selection).toContain("Discord");
      expect(selection).toContain("very well supported");
      expect(selection).toContain("Docs:");
      expect(selection).toContain("[discord](/channels/discord)");
      expect(selection).not.toContain("https://openclaw.ai");
    });
  });
});
