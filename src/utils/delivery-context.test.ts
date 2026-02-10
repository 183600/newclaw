import { describe, expect, it } from "vitest";
import type { DeliveryContext, DeliveryContextSessionSource } from "./delivery-context.js";
import {
  deliveryContextFromSession,
  deliveryContextKey,
  mergeDeliveryContext,
  normalizeDeliveryContext,
  normalizeSessionDeliveryFields,
} from "./delivery-context.js";

describe("normalizeDeliveryContext", () => {
  it("returns undefined for undefined input", () => {
    expect(normalizeDeliveryContext(undefined)).toBeUndefined();
  });

  it("returns undefined for empty object", () => {
    expect(normalizeDeliveryContext({})).toBeUndefined();
  });

  it("normalizes channel field", () => {
    const context = { channel: "  whatsapp  " };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ channel: "whatsapp" });
  });

  it("normalizes to field", () => {
    const context = { to: "  +1234567890  " };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ to: "+1234567890" });
  });

  it("normalizes accountId field", () => {
    const context = { accountId: "  account123  " };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ accountId: "account123" });
  });

  it("normalizes numeric threadId", () => {
    const context = { threadId: 123.456 };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ threadId: 123 });
  });

  it("normalizes string threadId", () => {
    const context = { threadId: "  thread123  " };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ threadId: "thread123" });
  });

  it("filters empty string threadId", () => {
    const context = { threadId: "   " };
    const result = normalizeDeliveryContext(context);
    expect(result).toBeUndefined();
  });

  it("filters non-finite numeric threadId", () => {
    const context = { threadId: NaN };
    const result = normalizeDeliveryContext(context);
    expect(result).toBeUndefined();
  });

  it("preserves valid context with all fields", () => {
    const context = {
      channel: "whatsapp",
      to: "+1234567890",
      accountId: "account123",
      threadId: "thread123",
    };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual(context);
  });

  it("handles non-string channel", () => {
    const context = { channel: 123 as any };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ channel: undefined });
  });

  it("handles non-string to", () => {
    const context = { to: 123 as any };
    const result = normalizeDeliveryContext(context);
    expect(result).toEqual({ to: undefined });
  });

  it("handles non-string threadId", () => {
    const context = { threadId: {} as any };
    const result = normalizeDeliveryContext(context);
    expect(result).toBeUndefined();
  });
});

describe("normalizeSessionDeliveryFields", () => {
  it("returns empty fields for undefined source", () => {
    const result = normalizeSessionDeliveryFields(undefined);
    expect(result).toEqual({
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    });
  });

  it("normalizes and merges delivery context", () => {
    const source: DeliveryContextSessionSource = {
      channel: "whatsapp",
      lastChannel: "telegram",
      lastTo: "+1234567890",
      lastAccountId: "account123",
      lastThreadId: "thread123",
      deliveryContext: {
        channel: "slack",
        to: "+9876543210",
        accountId: "account456",
        threadId: "thread456",
      },
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result.deliveryContext).toEqual({
      channel: "slack", // deliveryContext takes precedence
      to: "+9876543210",
      accountId: "account456",
      threadId: "thread456",
    });
    expect(result.lastChannel).toBe("slack");
    expect(result.lastTo).toBe("+9876543210");
    expect(result.lastAccountId).toBe("account456");
    expect(result.lastThreadId).toBe("thread456");
  });

  it("falls back to last fields when delivery context is missing", () => {
    const source: DeliveryContextSessionSource = {
      lastChannel: "telegram",
      lastTo: "+1234567890",
      lastAccountId: "account123",
      lastThreadId: "thread123",
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result.deliveryContext).toEqual({
      channel: "telegram",
      to: "+1234567890",
      accountId: "account123",
      threadId: "thread123",
    });
    expect(result.lastChannel).toBe("telegram");
    expect(result.lastTo).toBe("+1234567890");
    expect(result.lastAccountId).toBe("account123");
    expect(result.lastThreadId).toBe("thread123");
  });

  it("prefers lastChannel over channel when delivery context is missing", () => {
    const source: DeliveryContextSessionSource = {
      channel: "whatsapp",
      lastChannel: "telegram",
      lastTo: "+1234567890",
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result.deliveryContext).toEqual({
      channel: "telegram",
      to: "+1234567890",
    });
  });

  it("returns empty when all fields are invalid", () => {
    const source: DeliveryContextSessionSource = {
      channel: "",
      lastChannel: "",
      lastTo: "",
      lastAccountId: "",
      lastThreadId: "",
      deliveryContext: {},
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result.deliveryContext).toBeUndefined();
    expect(result.lastChannel).toBeUndefined();
    expect(result.lastTo).toBeUndefined();
    expect(result.lastAccountId).toBeUndefined();
    expect(result.lastThreadId).toBeUndefined();
  });
});

describe("deliveryContextFromSession", () => {
  it("returns undefined for undefined entry", () => {
    expect(deliveryContextFromSession(undefined)).toBeUndefined();
  });

  it("extracts delivery context from session entry", () => {
    const entry = {
      channel: "whatsapp",
      lastChannel: "telegram",
      lastTo: "+1234567890",
      lastAccountId: "account123",
      lastThreadId: "thread123",
      deliveryContext: {
        channel: "slack",
        to: "+9876543210",
      },
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "slack",
      to: "+9876543210",
      accountId: "account123",
      threadId: "thread123",
    });
  });

  it("uses origin threadId when lastThreadId and deliveryContext.threadId are missing", () => {
    const entry = {
      lastChannel: "telegram",
      lastTo: "+1234567890",
      origin: {
        threadId: "origin-thread",
      },
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "telegram",
      to: "+1234567890",
      threadId: "origin-thread",
    });
  });

  it("prioritizes lastThreadId over origin threadId", () => {
    const entry = {
      lastChannel: "telegram",
      lastTo: "+1234567890",
      lastThreadId: "last-thread",
      origin: {
        threadId: "origin-thread",
      },
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "telegram",
      to: "+1234567890",
      threadId: "last-thread",
    });
  });

  it("prioritizes deliveryContext.threadId over others", () => {
    const entry = {
      lastChannel: "telegram",
      lastTo: "+1234567890",
      lastThreadId: "last-thread",
      deliveryContext: {
        threadId: "delivery-thread",
      },
      origin: {
        threadId: "origin-thread",
      },
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({
      channel: "telegram",
      to: "+1234567890",
      threadId: "delivery-thread",
    });
  });
});

describe("mergeDeliveryContext", () => {
  it("returns undefined when both contexts are undefined", () => {
    expect(mergeDeliveryContext(undefined, undefined)).toBeUndefined();
  });

  it("returns primary when fallback is undefined", () => {
    const primary: DeliveryContext = { channel: "whatsapp", to: "+1234567890" };
    const result = mergeDeliveryContext(primary, undefined);
    expect(result).toEqual(primary);
  });

  it("returns fallback when primary is undefined", () => {
    const fallback: DeliveryContext = { channel: "telegram", to: "+9876543210" };
    const result = mergeDeliveryContext(undefined, fallback);
    expect(result).toEqual(fallback);
  });

  it("merges contexts with primary taking precedence", () => {
    const primary: DeliveryContext = {
      channel: "whatsapp",
      to: "+1234567890",
      accountId: "account123",
    };
    const fallback: DeliveryContext = {
      channel: "telegram",
      to: "+9876543210",
      accountId: "account456",
      threadId: "thread123",
    };
    const result = mergeDeliveryContext(primary, fallback);
    expect(result).toEqual({
      channel: "whatsapp", // from primary
      to: "+1234567890", // from primary
      accountId: "account123", // from primary
      threadId: "thread123", // from fallback
    });
  });

  it("handles partial contexts", () => {
    const primary: DeliveryContext = { channel: "whatsapp" };
    const fallback: DeliveryContext = { to: "+1234567890", threadId: "thread123" };
    const result = mergeDeliveryContext(primary, fallback);
    expect(result).toEqual({
      channel: "whatsapp",
      to: "+1234567890",
      threadId: "thread123",
    });
  });
});

describe("deliveryContextKey", () => {
  it("returns undefined when context is undefined", () => {
    expect(deliveryContextKey(undefined)).toBeUndefined();
  });

  it("returns undefined when channel is missing", () => {
    const context: DeliveryContext = { to: "+1234567890" };
    expect(deliveryContextKey(context)).toBeUndefined();
  });

  it("returns undefined when to is missing", () => {
    const context: DeliveryContext = { channel: "whatsapp" };
    expect(deliveryContextKey(context)).toBeUndefined();
  });

  it("creates key with channel and to", () => {
    const context: DeliveryContext = { channel: "whatsapp", to: "+1234567890" };
    expect(deliveryContextKey(context)).toBe("whatsapp|+1234567890||");
  });

  it("creates key with all fields", () => {
    const context: DeliveryContext = {
      channel: "whatsapp",
      to: "+1234567890",
      accountId: "account123",
      threadId: "thread123",
    };
    expect(deliveryContextKey(context)).toBe("whatsapp|+1234567890|account123|thread123");
  });

  it("handles numeric threadId", () => {
    const context: DeliveryContext = {
      channel: "whatsapp",
      to: "+1234567890",
      threadId: 123,
    };
    expect(deliveryContextKey(context)).toBe("whatsapp|+1234567890||123");
  });

  it("handles empty string threadId", () => {
    const context: DeliveryContext = {
      channel: "whatsapp",
      to: "+1234567890",
      threadId: "",
    };
    expect(deliveryContextKey(context)).toBe("whatsapp|+1234567890||");
  });

  it("normalizes context before creating key", () => {
    const context = {
      channel: "  whatsapp  ",
      to: "  +1234567890  ",
      accountId: "  account123  ",
      threadId: "  thread123  ",
    };
    expect(deliveryContextKey(context)).toBe("whatsapp|+1234567890|account123|thread123");
  });
});
