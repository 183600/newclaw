import { describe, expect, it, vi } from "vitest";
import type { PairingChannel } from "./pairing-store.js";
import { resolvePairingIdLabel } from "./pairing-labels.js";

// Mock the dependencies
vi.mock("../channels/plugins/pairing.js", () => ({
  getPairingAdapter: (channel: PairingChannel) => {
    const adapters: Record<PairingChannel, { idLabel: string }> = {
      telegram: { idLabel: "userId" },
      discord: { idLabel: "userId" },
      slack: { idLabel: "userId" },
      signal: { idLabel: "phoneNumber" },
      whatsapp: { idLabel: "phoneNumber" },
      imessage: { idLabel: "email" },
      web: { idLabel: "sessionId" },
    };
    return adapters[channel];
  },
}));

describe("resolvePairingIdLabel", () => {
  it("should return 'userId' for telegram", () => {
    const result = resolvePairingIdLabel("telegram");
    expect(result).toBe("userId");
  });

  it("should return 'userId' for discord", () => {
    const result = resolvePairingIdLabel("discord");
    expect(result).toBe("userId");
  });

  it("should return 'userId' for slack", () => {
    const result = resolvePairingIdLabel("slack");
    expect(result).toBe("userId");
  });

  it("should return 'phoneNumber' for signal", () => {
    const result = resolvePairingIdLabel("signal");
    expect(result).toBe("phoneNumber");
  });

  it("should return 'phoneNumber' for whatsapp", () => {
    const result = resolvePairingIdLabel("whatsapp");
    expect(result).toBe("phoneNumber");
  });

  it("should return 'email' for imessage", () => {
    const result = resolvePairingIdLabel("imessage");
    expect(result).toBe("email");
  });

  it("should return 'sessionId' for web", () => {
    const result = resolvePairingIdLabel("web");
    expect(result).toBe("sessionId");
  });

  it("should return 'userId' as default for unknown channels", () => {
    // Mock the getPairingAdapter to return undefined for unknown channels
    vi.doMock("../channels/plugins/pairing.js", () => ({
      getPairingAdapter: () => undefined,
    }));

    // This test assumes that if getPairingAdapter returns undefined,
    // the function falls back to "userId"
    const result = resolvePairingIdLabel("unknown" as PairingChannel);
    expect(result).toBe("userId");
  });
});
