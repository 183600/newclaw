import { describe, expect, it } from "vitest";
import {
  deliveryContextFromSession,
  deliveryContextKey,
  mergeDeliveryContext,
  normalizeDeliveryContext,
  normalizeSessionDeliveryFields,
  type DeliveryContext,
  type DeliveryContextSessionSource,
} from "./delivery-context.js";

describe("normalizeDeliveryContext", () => {
  it("returns undefined for undefined input", () => {
    expect(normalizeDeliveryContext(undefined)).toBeUndefined();
  });

  it("normalizes channel field", () => {
    expect(normalizeDeliveryContext({ channel: "whatsapp" })).toEqual({ channel: "whatsapp" });
    expect(normalizeDeliveryContext({ channel: "  WhatsApp  " })).toEqual({ channel: "whatsapp" });
    expect(normalizeDeliveryContext({ channel: "" })).toEqual({ channel: undefined });
    expect(normalizeDeliveryContext({ channel: "   " })).toEqual({ channel: undefined });
  });

  it("normalizes to field", () => {
    expect(normalizeDeliveryContext({ to: "+1234567890" })).toEqual({ to: "+1234567890" });
    expect(normalizeDeliveryContext({ to: "  +1234567890  " })).toEqual({ to: "+1234567890" });
    expect(normalizeDeliveryContext({ to: "" })).toEqual({ to: undefined });
    expect(normalizeDeliveryContext({ to: "   " })).toEqual({ to: undefined });
  });

  it("normalizes accountId field", () => {
    expect(normalizeDeliveryContext({ accountId: "test@example.com" })).toEqual({
      accountId: "test@example.com",
    });
    expect(normalizeDeliveryContext({ accountId: "  test@example.com  " })).toEqual({
      accountId: "test@example.com",
    });
    expect(normalizeDeliveryContext({ accountId: "" })).toEqual({ accountId: undefined });
    expect(normalizeDeliveryContext({ accountId: "   " })).toEqual({ accountId: undefined });
  });

  it("normalizes threadId field", () => {
    expect(normalizeDeliveryContext({ threadId: "123" })).toEqual({ threadId: "123" });
    expect(normalizeDeliveryContext({ threadId: "  123  " })).toEqual({ threadId: "123" });
    expect(normalizeDeliveryContext({ threadId: "" })).toEqual({ threadId: undefined });
    expect(normalizeDeliveryContext({ threadId: "   " })).toEqual({ threadId: undefined });
    expect(normalizeDeliveryContext({ threadId: 123.456 })).toEqual({ threadId: 123 });
    expect(normalizeDeliveryContext({ threadId: 123.789 })).toEqual({ threadId: 123 });
    expect(normalizeDeliveryContext({ threadId: Infinity })).toEqual({ threadId: undefined });
    expect(normalizeDeliveryContext({ threadId: -Infinity })).toEqual({ threadId: undefined });
    expect(normalizeDeliveryContext({ threadId: NaN })).toEqual({ threadId: undefined });
  });

  it("normalizes all fields together", () => {
    expect(
      normalizeDeliveryContext({
        channel: "WhatsApp",
        to: " +1234567890 ",
        accountId: " test@example.com ",
        threadId: " 123 ",
      }),
    ).toEqual({
      channel: "whatsapp",
      to: "+1234567890",
      accountId: "test@example.com",
      threadId: "123",
    });
  });

  it("returns undefined when all normalized values are empty and multiple fields were present", () => {
    expect(
      normalizeDeliveryContext({
        channel: "",
        to: "   ",
        accountId: "",
        threadId: "",
      }),
    ).toBeUndefined();
  });

  it("returns object with single field when only one field was present", () => {
    expect(normalizeDeliveryContext({ channel: "" })).toEqual({ channel: undefined });
    expect(normalizeDeliveryContext({ to: "" })).toEqual({ to: undefined });
    expect(normalizeDeliveryContext({ accountId: "" })).toEqual({ accountId: undefined });
    expect(normalizeDeliveryContext({ threadId: "" })).toEqual({ threadId: undefined });
  });

  it("only includes fields that were present in input", () => {
    const input: DeliveryContext = { channel: "whatsapp" };
    const result = normalizeDeliveryContext(input);
    expect(result).toEqual({ channel: "whatsapp" });
    expect("to" in result!).toBe(false);
    expect("accountId" in result!).toBe(false);
    expect("threadId" in result!).toBe(false);
  });
});

describe("mergeDeliveryContext", () => {
  it("returns undefined when both inputs are undefined", () => {
    expect(mergeDeliveryContext(undefined, undefined)).toBeUndefined();
  });

  it("returns primary when only primary is provided", () => {
    const primary = { channel: "whatsapp", to: "+1234567890" };
    expect(mergeDeliveryContext(primary, undefined)).toEqual(primary);
  });

  it("returns fallback when only fallback is provided", () => {
    const fallback = { channel: "telegram", to: "@username" };
    expect(mergeDeliveryContext(undefined, fallback)).toEqual(fallback);
  });

  it("merges primary and fallback with primary taking precedence", () => {
    const primary = { channel: "whatsapp", to: "+1234567890" };
    const fallback = { channel: "telegram", accountId: "test@example.com" };
    expect(mergeDeliveryContext(primary, fallback)).toEqual({
      channel: "whatsapp", // from primary
      to: "+1234567890", // from primary
      accountId: "test@example.com", // from fallback
    });
  });

  it("includes all fields that were present in either input", () => {
    const primary = { channel: "whatsapp" };
    const fallback = { accountId: "test@example.com" };
    const result = mergeDeliveryContext(primary, fallback);
    expect(result).toEqual({
      channel: "whatsapp",
      accountId: "test@example.com",
    });
    expect("to" in result!).toBe(false);
    expect("threadId" in result!).toBe(false);
  });
});

describe("normalizeSessionDeliveryFields", () => {
  it("returns all undefined values when source is undefined", () => {
    expect(normalizeSessionDeliveryFields(undefined)).toEqual({
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    });
  });

  it("normalizes deliveryContext and other fields", () => {
    const source: DeliveryContextSessionSource = {
      channel: "WhatsApp",
      lastChannel: "Telegram",
      lastTo: "+1234567890",
      lastAccountId: "test@example.com",
      lastThreadId: "123",
      deliveryContext: {
        channel: "Signal",
        to: "+9876543210",
      },
    };

    const result = normalizeSessionDeliveryFields(source);
    expect(result).toEqual({
      deliveryContext: {
        channel: "signal",
        to: "+9876543210",
      },
      lastChannel: "signal",
      lastTo: "+9876543210",
      lastAccountId: "test@example.com",
      lastThreadId: "123",
    });
  });

  it("merges deliveryContext with other fields", () => {
    const source: DeliveryContextSessionSource = {
      deliveryContext: {
        channel: "WhatsApp",
        to: "+1234567890",
      },
      lastAccountId: "test@example.com",
      lastThreadId: "123",
    };

    const result = normalizeSessionDeliveryFields(source);
    expect(result).toEqual({
      deliveryContext: {
        channel: "whatsapp",
        to: "+1234567890",
        accountId: "test@example.com",
        threadId: "123",
      },
      lastChannel: "whatsapp",
      lastTo: "+1234567890",
      lastAccountId: "test@example.com",
      lastThreadId: "123",
    });
  });

  it("prioritizes channel over lastChannel", () => {
    const source: DeliveryContextSessionSource = {
      channel: "WhatsApp",
      lastChannel: "Telegram",
      deliveryContext: {
        accountId: "test@example.com",
      },
    };

    const result = normalizeSessionDeliveryFields(source);
    expect(result.deliveryContext?.channel).toBe("whatsapp");
    expect(result.lastChannel).toBe("whatsapp");
  });
});

describe("deliveryContextFromSession", () => {
  it("returns undefined when entry is undefined", () => {
    expect(deliveryContextFromSession(undefined)).toBeUndefined();
  });

  it("extracts delivery context from session entry", () => {
    const entry = {
      channel: "WhatsApp",
      lastChannel: "Telegram",
      lastTo: "+1234567890",
      lastAccountId: "test@example.com",
      lastThreadId: "123",
      deliveryContext: {
        channel: "Signal",
        to: "+9876543210",
      },
    };

    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "signal",
      to: "+9876543210",
    });
  });

  it("uses origin.threadId when lastThreadId is not provided", () => {
    const entry = {
      deliveryContext: {
        channel: "WhatsApp",
      },
      origin: {
        threadId: "456",
      },
    };

    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "whatsapp",
      threadId: "456",
    });
  });

  it("prioritizes lastThreadId over origin.threadId", () => {
    const entry = {
      lastThreadId: "123",
      deliveryContext: {
        channel: "WhatsApp",
      },
      origin: {
        threadId: "456",
      },
    };

    const result = deliveryContextFromSession(entry);
    expect(result?.threadId).toBe("123");
  });
});

describe("deliveryContextKey", () => {
  it("returns undefined when context is undefined", () => {
    expect(deliveryContextKey(undefined)).toBeUndefined();
  });

  it("returns undefined when channel is missing", () => {
    expect(deliveryContextKey({ to: "+1234567890" })).toBeUndefined();
  });

  it("returns undefined when to is missing", () => {
    expect(deliveryContextKey({ channel: "whatsapp" })).toBeUndefined();
  });

  it("creates key with channel and to", () => {
    expect(deliveryContextKey({ channel: "whatsapp", to: "+1234567890" })).toBe(
      "whatsapp|+1234567890||",
    );
  });

  it("includes accountId in key", () => {
    expect(
      deliveryContextKey({
        channel: "whatsapp",
        to: "+1234567890",
        accountId: "test@example.com",
      }),
    ).toBe("whatsapp|+1234567890|test@example.com|");
  });

  it("includes threadId in key", () => {
    expect(
      deliveryContextKey({
        channel: "whatsapp",
        to: "+1234567890",
        threadId: "123",
      }),
    ).toBe("whatsapp|+1234567890||123");
  });

  it("includes all fields in key", () => {
    expect(
      deliveryContextKey({
        channel: "whatsapp",
        to: "+1234567890",
        accountId: "test@example.com",
        threadId: "123",
      }),
    ).toBe("whatsapp|+1234567890|test@example.com|123");
  });

  it("handles numeric threadId", () => {
    expect(
      deliveryContextKey({
        channel: "whatsapp",
        to: "+1234567890",
        threadId: 123,
      }),
    ).toBe("whatsapp|+1234567890||123");
  });

  it("handles empty threadId", () => {
    expect(
      deliveryContextKey({
        channel: "whatsapp",
        to: "+1234567890",
        threadId: "",
      }),
    ).toBe("whatsapp|+1234567890||");
  });
});
