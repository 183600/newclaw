import { describe, expect, it, vi } from "vitest";
import {
  withWhatsAppPrefix,
  normalizeE164,
  isSelfChatMode,
  toWhatsappJid,
  jidToE164,
  resolveJidToE164,
} from "../utils.js";

describe("WhatsApp utilities - Additional Tests", () => {
  describe("withWhatsAppPrefix", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => withWhatsAppPrefix(null as unknown)).toThrow();
      expect(() => withWhatsAppPrefix(undefined as unknown)).toThrow();
    });

    it("handles empty string", () => {
      expect(withWhatsAppPrefix("")).toBe("whatsapp:");
    });

    it("handles numbers", () => {
      // The function expects a string, so passing a number should throw
      expect(() => withWhatsAppPrefix(1234567890 as unknown)).toThrow();
    });

    it("handles already prefixed with different case", () => {
      // The function checks for exact "whatsapp:" prefix, case-sensitive
      expect(withWhatsAppPrefix("WHATSAPP:+1234567890")).toBe("whatsapp:WHATSAPP:+1234567890");
      expect(withWhatsAppPrefix("WhatsApp:+1234567890")).toBe("whatsapp:WhatsApp:+1234567890");
    });

    it("handles whitespace", () => {
      expect(withWhatsAppPrefix("  +1234567890  ")).toBe("whatsapp:  +1234567890  ");
    });
  });

  describe("normalizeE164", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => normalizeE164(null as unknown)).toThrow();
      expect(() => normalizeE164(undefined as unknown)).toThrow();
    });

    it("handles empty string", () => {
      expect(normalizeE164("")).toBe("+");
    });

    it("handles numbers", () => {
      // The function expects a string, so passing a number should throw
      expect(() => normalizeE164(1234567890 as unknown)).toThrow();
    });

    it("handles international numbers with country codes", () => {
      expect(normalizeE164("+44 20 7946 0958")).toBe("+442079460958");
      expect(normalizeE164("+1 (555) 123-4567")).toBe("+15551234567");
    });

    it("handles special characters in numbers", () => {
      expect(normalizeE164("+1.555.123.4567")).toBe("+15551234567");
      expect(normalizeE164("+1-555-123-4567")).toBe("+15551234567");
    });

    it("handles extension numbers", () => {
      expect(normalizeE164("+1 555 123 4567 ext. 123")).toBe("+15551234567123");
      expect(normalizeE164("+1 555 123 4567 x123")).toBe("+15551234567123");
    });

    it("handles non-numeric characters", () => {
      expect(normalizeE164("phone: +1 555 123 4567")).toBe("+15551234567");
      expect(normalizeE164("tel:+1-555-123-4567")).toBe("+15551234567");
    });
  });

  describe("isSelfChatMode", () => {
    it("handles null selfE164 with allowFrom", () => {
      expect(isSelfChatMode(null, ["+1234567890"])).toBe(false);
      expect(isSelfChatMode(null, ["*"])).toBe(false);
    });

    it("handles undefined selfE164 with allowFrom", () => {
      expect(isSelfChatMode(undefined, ["+1234567890"])).toBe(false);
      expect(isSelfChatMode(undefined, ["*"])).toBe(false);
    });

    it("handles empty string selfE164", () => {
      expect(isSelfChatMode("", ["+1234567890"])).toBe(false);
      // Empty string selfE164 doesn't match empty string in allowFrom
      // because normalizeE164("") returns "+", not ""
      expect(isSelfChatMode("", [""])).toBe(false);
    });

    it("handles allowFrom with mixed formats", () => {
      expect(isSelfChatMode("+1234567890", ["+1234567890", "whatsapp:+1234567890"])).toBe(true);
      expect(isSelfChatMode("+1234567890", ["9876543210", "whatsapp:+1234567890"])).toBe(true);
    });

    it("handles allowFrom with numbers that need normalization", () => {
      expect(isSelfChatMode("+1234567890", ["1 (234) 567-890"])).toBe(true);
      expect(isSelfChatMode("+1234567890", ["+1 (234) 567-890"])).toBe(true);
      expect(isSelfChatMode("+1234567890", ["whatsapp:1 (234) 567-890"])).toBe(true);
    });

    it("handles allowFrom with invalid numbers", () => {
      expect(isSelfChatMode("+1234567890", ["abc", "def"])).toBe(false);
      expect(isSelfChatMode("+1234567890", ["+0"])).toBe(false);
    });

    it("handles allowFrom with duplicate entries", () => {
      expect(isSelfChatMode("+1234567890", ["+1234567890", "+1234567890"])).toBe(true);
    });
  });

  describe("toWhatsappJid", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => toWhatsappJid(null as unknown)).toThrow();
      expect(() => toWhatsappJid(undefined as unknown)).toThrow();
    });

    it("handles empty string", () => {
      expect(toWhatsappJid("")).toBe("@s.whatsapp.net");
    });

    it("handles numbers", () => {
      // The function expects a string, so passing a number should throw
      expect(() => toWhatsappJid(1234567890 as unknown)).toThrow();
    });

    it("handles JIDs with different domains", () => {
      expect(toWhatsappJid("1234567890@g.us")).toBe("1234567890@g.us");
      expect(toWhatsappJid("1234567890@broadcast")).toBe("1234567890@broadcast");
    });

    it("handles complex device suffixes", () => {
      expect(toWhatsappJid("1234567890:123@s.whatsapp.net")).toBe("1234567890:123@s.whatsapp.net");
      expect(toWhatsappJid("1234567890:0@s.whatsapp.net")).toBe("1234567890:0@s.whatsapp.net");
    });

    it("handles numbers with special characters", () => {
      expect(toWhatsappJid("+1 (555) 123-4567")).toBe("15551234567@s.whatsapp.net");
    });
  });

  describe("jidToE164", () => {
    it("handles null and undefined inputs", () => {
      // The function doesn't handle null/undefined, so we expect it to throw
      expect(() => jidToE164(null as unknown)).toThrow();
      expect(() => jidToE164(undefined as unknown)).toThrow();
    });

    it("handles empty string", () => {
      expect(jidToE164("")).toBe(null);
    });

    it("handles JIDs with invalid format", () => {
      expect(jidToE164("invalid")).toBe(null);
      expect(jidToE164("@s.whatsapp.net")).toBe(null);
      expect(jidToE164("abc@s.whatsapp.net")).toBe(null);
      expect(jidToE164("1234567890@invalid.domain")).toBe(null);
    });

    it("handles hosted domain with device suffix", () => {
      expect(jidToE164("1234567890:1@hosted")).toBe("+1234567890");
    });

    it("handles very long numbers", () => {
      const longNumber = "1".repeat(15);
      expect(jidToE164(`${longNumber}@s.whatsapp.net`)).toBe(`+${longNumber}`);
    });

    it("handles numbers with leading zeros", () => {
      expect(jidToE164("001234567890@s.whatsapp.net")).toBe("+001234567890");
    });
  });

  describe("resolveJidToE164", () => {
    it("handles null and undefined inputs", async () => {
      expect(await resolveJidToE164(null)).toBe(null);
      expect(await resolveJidToE164(undefined)).toBe(null);
    });

    it("handles empty string", async () => {
      expect(await resolveJidToE164("")).toBe(null);
    });

    it("handles direct JID conversion without lookup", async () => {
      expect(await resolveJidToE164("1234567890@s.whatsapp.net")).toBe("+1234567890");
    });

    it("returns null for non-LID JIDs when no lookup provided", async () => {
      expect(await resolveJidToE164("1234567890@lid")).toBe(null);
    });

    it("uses lidLookup when provided", async () => {
      const mockLookup = {
        getPNForLID: vi.fn().mockResolvedValue("1234567890@s.whatsapp.net"),
      };

      const result = await resolveJidToE164("1234567890@lid", { lidLookup: mockLookup });
      expect(result).toBe("+1234567890");
      expect(mockLookup.getPNForLID).toHaveBeenCalledWith("1234567890@lid");
    });

    it("handles lookup errors gracefully", async () => {
      const mockLookup = {
        getPNForLID: vi.fn().mockRejectedValue(new Error("Lookup failed")),
      };

      const result = await resolveJidToE164("1234567890@lid", { lidLookup: mockLookup });
      expect(result).toBe(null);
    });

    it("handles lookup returning null", async () => {
      const mockLookup = {
        getPNForLID: vi.fn().mockResolvedValue(null),
      };

      const result = await resolveJidToE164("1234567890@lid", { lidLookup: mockLookup });
      expect(result).toBe(null);
    });

    it("handles lookup returning invalid JID", async () => {
      const mockLookup = {
        getPNForLID: vi.fn().mockResolvedValue("invalid-jid"),
      };

      const result = await resolveJidToE164("1234567890@lid", { lidLookup: mockLookup });
      expect(result).toBe(null);
    });

    it("passes options to direct conversion", async () => {
      const opts = { logMissing: true };
      expect(await resolveJidToE164("1234567890@s.whatsapp.net", opts)).toBe("+1234567890");
    });
  });
});
