import { describe, expect, it, beforeEach, vi } from "vitest";
import type { DeliveryContext, DeliveryContextSessionSource } from "./delivery-context.js";
import {
  normalizeDeliveryContext,
  normalizeSessionDeliveryFields,
  deliveryContextFromSession,
  mergeDeliveryContext,
  deliveryContextKey,
} from "./delivery-context.js";

// Mock dependencies
vi.mock("./account-id.js", () => ({
  normalizeAccountId: vi.fn((id) => id?.trim() || undefined),
}));

vi.mock("./message-channel.js", () => ({
  normalizeMessageChannel: vi.fn((channel) => channel?.toLowerCase() || undefined),
}));

describe("normalizeDeliveryContext", () => {
  it("should return undefined for undefined input", () => {
    const result = normalizeDeliveryContext(undefined);
    expect(result).toBeUndefined();
  });

  it("should normalize string fields", async () => {
    const { normalizeMessageChannel, normalizeAccountId } = await import("./message-channel.js");
    vi.mocked(normalizeMessageChannel).mockReturnValue("whatsapp");
    vi.mocked(normalizeAccountId).mockReturnValue("account123");

    const context: DeliveryContext = {
      channel: "WhatsApp",
      to: "  test@example.com  ",
      accountId: "  account123  ",
      threadId: "  thread123  ",
    };
    const result = normalizeDeliveryContext(context);

    expect(result).toEqual({
      channel: "whatsapp",
      to: "test@example.com",
      accountId: "account123",
      threadId: "thread123",
    });
  });

  it("should handle number threadId", () => {
    const context: DeliveryContext = {
      threadId: 123.456,
    };
    const result = normalizeDeliveryContext(context);

    expect(result?.threadId).toBe(123);
  });

  it("should handle infinite number threadId", () => {
    const context: DeliveryContext = {
      threadId: Number.POSITIVE_INFINITY,
    };
    const result = normalizeDeliveryContext(context);

    expect(result?.threadId).toBeUndefined();
  });

  it("should handle empty string threadId", () => {
    const context: DeliveryContext = {
      threadId: "",
    };
    const result = normalizeDeliveryContext(context);

    expect(result?.threadId).toBeUndefined();
  });

  it("should return undefined when all fields are undefined", () => {
    const context: DeliveryContext = {};
    const result = normalizeDeliveryContext(context);

    expect(result).toBeUndefined();
  });

  it("should preserve fields that were present in input", () => {
    const context: DeliveryContext = {
      channel: undefined,
      to: "test@example.com",
    };
    const result = normalizeDeliveryContext(context);

    expect(result).toEqual({
      channel: undefined,
      to: "test@example.com",
    });
  });

  it("should return undefined when all normalized values are empty", () => {
    const context: DeliveryContext = {
      channel: "",
      to: "",
      accountId: "",
      threadId: "",
    };
    const result = normalizeDeliveryContext(context);

    expect(result).toBeUndefined();
  });

  it("should handle single undefined field", () => {
    const context: DeliveryContext = {
      channel: undefined,
    };
    const result = normalizeDeliveryContext(context);

    expect(result).toEqual({
      channel: undefined,
    });
  });
});

describe("normalizeSessionDeliveryFields", () => {
  it("should return all undefined for undefined source", () => {
    const result = normalizeSessionDeliveryFields(undefined);

    expect(result).toEqual({
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    });
  });

  it("should merge delivery context with last values", () => {
    const source: DeliveryContextSessionSource = {
      deliveryContext: {
        channel: "telegram",
        to: "user123",
      },
      lastChannel: "whatsapp",
      lastTo: "test@example.com",
      lastAccountId: "account123",
      lastThreadId: "thread123",
    };
    const result = normalizeSessionDeliveryFields(source);

    expect(result).toEqual({
      deliveryContext: {
        channel: "telegram", // Primary takes precedence
        to: "user123", // Primary takes precedence
        accountId: "account123", // From last values
        threadId: "thread123", // From last values
      },
      lastChannel: "telegram",
      lastTo: "user123",
      lastAccountId: "account123",
      lastThreadId: "thread123",
    });
  });

  it("should use channel as fallback for lastChannel", () => {
    const source: DeliveryContextSessionSource = {
      channel: "telegram",
      deliveryContext: {
        to: "user123",
      },
    };
    const result = normalizeSessionDeliveryFields(source);

    expect(result.deliveryContext?.channel).toBe("telegram");
    expect(result.lastChannel).toBe("telegram");
  });

  it("should return all undefined when merged result is empty", () => {
    const source: DeliveryContextSessionSource = {
      deliveryContext: {},
      lastChannel: "",
      lastTo: "",
      lastAccountId: "",
      lastThreadId: "",
    };
    const result = normalizeSessionDeliveryFields(source);

    expect(result).toEqual({
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    });
  });
});

describe("deliveryContextFromSession", () => {
  it("should return undefined for undefined entry", () => {
    const result = deliveryContextFromSession(undefined);
    expect(result).toBeUndefined();
  });

  it("should extract delivery context from session entry", () => {
    const entry = {
      channel: "telegram",
      lastChannel: "whatsapp",
      lastTo: "test@example.com",
      lastAccountId: "account123",
      lastThreadId: "thread123",
      deliveryContext: {
        channel: "telegram",
        to: "user123",
      },
    };
    const result = deliveryContextFromSession(entry);

    expect(result).toEqual({
      channel: "telegram",
      to: "user123",
      accountId: "account123",
      threadId: "thread123",
    });
  });

  it("should use origin.threadId as fallback for lastThreadId", () => {
    const entry = {
      deliveryContext: {
        channel: "telegram",
        to: "user123",
      },
      origin: {
        threadId: "origin-thread",
      },
    };
    const result = deliveryContextFromSession(entry);

    expect(result?.threadId).toBe("origin-thread");
  });

  it("should prioritize lastThreadId over origin.threadId", () => {
    const entry = {
      lastThreadId: "last-thread",
      origin: {
        threadId: "origin-thread",
      },
      deliveryContext: {
        channel: "telegram",
        to: "user123",
      },
    };
    const result = deliveryContextFromSession(entry);

    expect(result?.threadId).toBe("last-thread");
  });
});

describe("mergeDeliveryContext", () => {
  it("should return undefined when both contexts are undefined", () => {
    const result = mergeDeliveryContext(undefined, undefined);
    expect(result).toBeUndefined();
  });

  it("should return primary when fallback is undefined", () => {
    const primary: DeliveryContext = {
      channel: "telegram",
      to: "user123",
    };
    const result = mergeDeliveryContext(primary, undefined);

    expect(result).toEqual({
      channel: "telegram",
      to: "user123",
    });
  });

  it("should return fallback when primary is undefined", () => {
    const fallback: DeliveryContext = {
      channel: "whatsapp",
      to: "test@example.com",
    };
    const result = mergeDeliveryContext(undefined, fallback);

    expect(result).toEqual({
      channel: "whatsapp",
      to: "test@example.com",
    });
  });

  it("should merge contexts with primary taking precedence", () => {
    const primary: DeliveryContext = {
      channel: "telegram",
      to: "user123",
    };
    const fallback: DeliveryContext = {
      channel: "whatsapp",
      accountId: "account123",
      threadId: "thread123",
    };
    const result = mergeDeliveryContext(primary, fallback);

    expect(result).toEqual({
      channel: "telegram", // From primary
      to: "user123", // From primary
      accountId: "account123", // From fallback
      threadId: "thread123", // From fallback
    });
  });

  it("should normalize merged result", async () => {
    const { normalizeMessageChannel } = await import("./message-channel.js");
    vi.mocked(normalizeMessageChannel).mockReturnValue("telegram");

    const primary: DeliveryContext = {
      channel: "Telegram",
    };
    const fallback: DeliveryContext = {
      to: "test@example.com",
    };
    const result = mergeDeliveryContext(primary, fallback);

    expect(result?.channel).toBe("telegram");
    expect(result?.to).toBe("test@example.com");
  });
});

describe("deliveryContextKey", () => {
  it("should return undefined for undefined context", () => {
    const result = deliveryContextKey(undefined);
    expect(result).toBeUndefined();
  });

  it("should return undefined when channel is missing", () => {
    const context: DeliveryContext = {
      to: "test@example.com",
    };
    const result = deliveryContextKey(context);
    expect(result).toBeUndefined();
  });

  it("should return undefined when to is missing", () => {
    const context: DeliveryContext = {
      channel: "telegram",
    };
    const result = deliveryContextKey(context);
    expect(result).toBeUndefined();
  });

  it("should generate key with channel and to", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user123",
    };
    const result = deliveryContextKey(context);
    expect(result).toBe("telegram|user123||");
  });

  it("should generate key with all fields", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user123",
      accountId: "account123",
      threadId: "thread123",
    };
    const result = deliveryContextKey(context);
    expect(result).toBe("telegram|user123|account123|thread123");
  });

  it("should handle number threadId", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user123",
      threadId: 123,
    };
    const result = deliveryContextKey(context);
    expect(result).toBe("telegram|user123||123");
  });

  it("should handle empty threadId", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user123",
      threadId: "",
    };
    const result = deliveryContextKey(context);
    expect(result).toBe("telegram|user123||");
  });

  it("should handle zero threadId", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user123",
      threadId: 0,
    };
    const result = deliveryContextKey(context);
    expect(result).toBe("telegram|user123||0");
  });
});
