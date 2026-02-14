import { describe, expect, it, vi } from "vitest";
import {
  isSelfChatMode,
  toWhatsappJid,
  clampNumber,
  clampInt,
  normalizeE164,
  withWhatsAppPrefix,
  normalizePath,
  assertWebChannel,
} from "./utils.js";

describe("clampNumber", () => {
  it("clamps value within range", () => {
    expect(clampNumber(5, 1, 10)).toBe(5);
    expect(clampNumber(0, 1, 10)).toBe(1);
    expect(clampNumber(15, 1, 10)).toBe(10);
  });

  it("handles negative numbers", () => {
    expect(clampNumber(-5, -10, -1)).toBe(-5);
    expect(clampNumber(-15, -10, -1)).toBe(-10);
    expect(clampNumber(0, -10, -1)).toBe(-1);
  });

  it("handles equal bounds", () => {
    expect(clampNumber(5, 5, 5)).toBe(5);
    expect(clampNumber(1, 5, 5)).toBe(5);
    expect(clampNumber(10, 5, 5)).toBe(5);
  });
});

describe("clampInt", () => {
  it("clamps and floors to integer", () => {
    expect(clampInt(5.7, 1, 10)).toBe(5);
    expect(clampInt(0.9, 1, 10)).toBe(1);
    expect(clampInt(10.1, 1, 10)).toBe(10);
  });

  it("handles negative floats", () => {
    expect(clampInt(-5.7, -10, -1)).toBe(-6);
    expect(clampInt(-15.2, -10, -1)).toBe(-10);
    expect(clampInt(-0.1, -10, -1)).toBe(-1);
  });
});

describe("isSelfChatMode", () => {
  it("returns false when selfE164 is null/undefined", () => {
    expect(isSelfChatMode(null, ["+1234567890"])).toBe(false);
    expect(isSelfChatMode(undefined, ["+1234567890"])).toBe(false);
  });

  it("returns false when allowFrom is empty", () => {
    expect(isSelfChatMode("+1234567890", [])).toBe(false);
    expect(isSelfChatMode("+1234567890", null)).toBe(false);
    expect(isSelfChatMode("+1234567890", undefined)).toBe(false);
  });

  it("returns false when allowFrom contains only wildcard", () => {
    expect(isSelfChatMode("+1234567890", ["*"])).toBe(false);
  });

  it("returns true when allowFrom contains matching number even with wildcard", () => {
    expect(isSelfChatMode("+1234567890", ["+1234567890", "*"])).toBe(true);
  });
  it("returns true when selfE164 matches allowFrom entry", () => {
    expect(isSelfChatMode("+1234567890", ["+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1234567890", [1234567890])).toBe(true);
    expect(isSelfChatMode("+1234567890", ["+15555555555", "+1234567890"])).toBe(true);
  });

  it("handles different number formats", () => {
    expect(isSelfChatMode("+1234567890", ["1234567890"])).toBe(true);
    expect(isSelfChatMode("1234567890", ["+1234567890"])).toBe(true);
    expect(isSelfChatMode("+1 (234) 567-890", ["+1234567890"])).toBe(true);
  });

  it("returns false for non-matching numbers", () => {
    expect(isSelfChatMode("+1234567890", ["+0987654321"])).toBe(false);
    expect(isSelfChatMode("+1234567890", ["+15555555555"])).toBe(false);
  });
});

describe("toWhatsappJid", () => {
  it("converts E164 numbers to JID format", () => {
    expect(toWhatsappJid("+1234567890")).toBe("1234567890@s.whatsapp.net");
    expect(toWhatsappJid("1234567890")).toBe("1234567890@s.whatsapp.net");
  });

  it("preserves existing JID format", () => {
    expect(toWhatsappJid("1234567890@s.whatsapp.net")).toBe("1234567890@s.whatsapp.net");
    expect(toWhatsappJid("1234567890@hosted")).toBe("1234567890@hosted");
  });

  it("handles whatsapp prefix", () => {
    expect(toWhatsappJid("whatsapp:+1234567890")).toBe("1234567890@s.whatsapp.net");
    expect(toWhatsappJid("whatsapp:1234567890")).toBe("1234567890@s.whatsapp.net");
  });

  it("handles device suffixes in JIDs", () => {
    expect(toWhatsappJid("1234567890:1@s.whatsapp.net")).toBe("1234567890:1@s.whatsapp.net");
    expect(toWhatsappJid("1234567890:15@hosted")).toBe("1234567890:15@hosted");
  });

  it("cleans non-digit characters", () => {
    expect(toWhatsappJid("+1 (234) 567-890")).toBe("1234567890@s.whatsapp.net");
    expect(toWhatsappJid("whatsapp:+1 (234) 567-890")).toBe("1234567890@s.whatsapp.net");
  });
});

describe("assertWebChannel", () => {
  it("passes for valid web channel", () => {
    expect(() => assertWebChannel("web")).not.toThrow();
  });

  it("throws for invalid channels", () => {
    expect(() => assertWebChannel("telegram")).toThrow("Web channel must be 'web'");
    expect(() => assertWebChannel("whatsapp")).toThrow("Web channel must be 'web'");
    expect(() => assertWebChannel("")).toThrow("Web channel must be 'web'");
    expect(() => assertWebChannel("WEB")).toThrow("Web channel must be 'web'");
  });
});

describe("normalizePath advanced cases", () => {
  it("handles empty string", () => {
    expect(normalizePath("")).toBe("/");
  });

  it("handles multiple leading slashes", () => {
    expect(normalizePath("///path")).toBe("///path");
  });
  it("preserves trailing slashes", () => {
    expect(normalizePath("path/")).toBe("/path/");
    expect(normalizePath("/path/")).toBe("/path/");
  });

  it("handles complex paths", () => {
    expect(normalizePath("api/v1/users")).toBe("/api/v1/users");
    expect(normalizePath("/api/v1/users")).toBe("/api/v1/users");
  });
});

describe("normalizeE164 advanced cases", () => {
  it("handles international format with spaces", () => {
    expect(normalizeE164("+1 234 567 890")).toBe("+1234567890");
    expect(normalizeE164("+44 20 7946 0958")).toBe("+442079460958");
  });

  it("handles formatted numbers with parentheses", () => {
    expect(normalizeE164("+1 (234) 567-890")).toBe("+1234567890");
    expect(normalizeE164("(234) 567-890")).toBe("+234567890");
  });

  it("handles whatsapp prefix", () => {
    expect(normalizeE164("whatsapp:+1234567890")).toBe("+1234567890");
    expect(normalizeE164("whatsapp:1234567890")).toBe("+1234567890");
  });

  it("handles edge cases", () => {
    expect(normalizeE164("")).toBe("+");
    expect(normalizeE164("invalid")).toBe("+");
    expect(normalizeE164("+")).toBe("+");
  });
});

describe("withWhatsAppPrefix advanced cases", () => {
  it("handles various input formats", () => {
    expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
    expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
    expect(withWhatsAppPrefix("whatsapp:1234567890")).toBe("whatsapp:1234567890");
  });

  it("handles formatted numbers", () => {
    expect(withWhatsAppPrefix("+1 (234) 567-890")).toBe("whatsapp:+1 (234) 567-890");
    expect(withWhatsAppPrefix("(234) 567-890")).toBe("whatsapp:(234) 567-890");
  });

  it("handles empty and edge cases", () => {
    expect(withWhatsAppPrefix("")).toBe("whatsapp:");
    expect(withWhatsAppPrefix("whatsapp:")).toBe("whatsapp:");
  });
});
