import { describe, expect, it } from "vitest";
import {
  withWhatsAppPrefix,
  normalizeE164,
  isSelfChatMode,
  toWhatsappJid,
  jidToE164,
} from "../utils.ts";

describe("WhatsApp utilities", () => {
  describe("withWhatsAppPrefix", () => {
    it("adds whatsapp prefix if not present", () => {
      expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
    });

    it("keeps whatsapp prefix if already present", () => {
      expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
    });

    it("handles numbers without plus sign", () => {
      expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
    });
  });

  describe("normalizeE164", () => {
    it("adds plus sign if missing", () => {
      expect(normalizeE164("1234567890")).toBe("+1234567890");
    });

    it("keeps plus sign if present", () => {
      expect(normalizeE164("+1234567890")).toBe("+1234567890");
    });

    it("removes whatsapp prefix", () => {
      expect(normalizeE164("whatsapp:+1234567890")).toBe("+1234567890");
    });

    it("removes non-digit characters except plus", () => {
      expect(normalizeE164("whatsapp:+1 (234) 567-890")).toBe("+1234567890");
    });

    it("handles empty strings", () => {
      expect(normalizeE164("")).toBe("+");
    });
  });

  describe("isSelfChatMode", () => {
    it("returns false when selfE164 is null", () => {
      expect(isSelfChatMode(null, ["+1234567890"])).toBe(false);
    });

    it("returns false when allowFrom is empty", () => {
      expect(isSelfChatMode("+1234567890", [])).toBe(false);
    });

    it("returns false when allowFrom is null", () => {
      expect(isSelfChatMode("+1234567890", null)).toBe(false);
    });

    it("returns false when allowFrom contains only wildcard", () => {
      expect(isSelfChatMode("+1234567890", ["*"])).toBe(false);
    });

    it("returns true when selfE164 matches allowFrom entry", () => {
      expect(isSelfChatMode("+1234567890", ["+1234567890"])).toBe(true);
    });

    it("handles number formats without plus", () => {
      expect(isSelfChatMode("+1234567890", ["1234567890"])).toBe(true);
    });

    it("handles mixed formats", () => {
      expect(isSelfChatMode("+1234567890", ["whatsapp:+1234567890"])).toBe(true);
    });

    it("returns false when no match", () => {
      expect(isSelfChatMode("+1234567890", ["+9876543210"])).toBe(false);
    });
  });

  describe("toWhatsappJid", () => {
    it("converts number to JID format", () => {
      expect(toWhatsappJid("+1234567890")).toBe("1234567890@s.whatsapp.net");
    });

    it("removes whatsapp prefix", () => {
      expect(toWhatsappJid("whatsapp:+1234567890")).toBe("1234567890@s.whatsapp.net");
    });

    it("keeps existing JID format", () => {
      expect(toWhatsappJid("1234567890@s.whatsapp.net")).toBe("1234567890@s.whatsapp.net");
    });

    it("handles JID with device suffix", () => {
      expect(toWhatsappJid("1234567890:1@s.whatsapp.net")).toBe("1234567890:1@s.whatsapp.net");
    });
  });

  describe("jidToE164", () => {
    it("converts standard JID to E164", () => {
      expect(jidToE164("1234567890@s.whatsapp.net")).toBe("+1234567890");
    });

    it("converts JID with device suffix to E164", () => {
      expect(jidToE164("1234567890:1@s.whatsapp.net")).toBe("+1234567890");
    });

    it("converts hosted JID to E164", () => {
      expect(jidToE164("1234567890@hosted")).toBe("+1234567890");
    });

    it("returns null for invalid JID format", () => {
      expect(jidToE164("invalid")).toBe(null);
      expect(jidToE164("1234567890@invalid.domain")).toBe(null);
    });

    it("returns null for LID JID without mapping", () => {
      expect(jidToE164("1234567890@lid")).toBe(null);
    });
  });
});
