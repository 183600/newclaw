import { describe, expect, it } from "vitest";
import {
  normalizeDeliveryContext,
  normalizeSessionDeliveryFields,
  deliveryContextFromSession,
  mergeDeliveryContext,
  deliveryContextKey,
  type DeliveryContext,
  type DeliveryContextSessionSource,
} from "./delivery-context.js";

describe("normalizeDeliveryContext", () => {
  it("should return undefined for undefined input", () => {
    expect(normalizeDeliveryContext(undefined)).toBeUndefined();
  });

  it("should return undefined for empty object", () => {
    expect(normalizeDeliveryContext({})).toBeUndefined();
  });

  it("should normalize channel", () => {
    const result = normalizeDeliveryContext({ channel: " telegram " });
    expect(result?.channel).toBe("telegram");
  });

  it("should normalize to by trimming", () => {
    const result = normalizeDeliveryContext({ to: "  user123  " });
    expect(result?.to).toBe("user123");
  });

  it("should handle empty to field", () => {
    const result = normalizeDeliveryContext({ to: "   " });
    expect(result?.to).toBeUndefined();
  });

  it("should normalize accountId", () => {
    const result = normalizeDeliveryContext({ accountId: "  account123  " });
    expect(result?.accountId).toBe("account123");
  });

  it("should handle numeric threadId", () => {
    const result = normalizeDeliveryContext({ threadId: 123.456 });
    expect(result?.threadId).toBe(123);
  });

  it("should handle infinite numeric threadId", () => {
    const result = normalizeDeliveryContext({ threadId: Infinity });
    expect(result?.threadId).toBeUndefined();
  });

  it("should handle string threadId", () => {
    const result = normalizeDeliveryContext({ threadId: "  thread123  " });
    expect(result?.threadId).toBe("thread123");
  });

  it("should handle empty string threadId", () => {
    const result = normalizeDeliveryContext({ threadId: "   " });
    expect(result?.threadId).toBeUndefined();
  });

  it("should return undefined if all normalized values are undefined and multiple fields were present", () => {
    const result = normalizeDeliveryContext({
      channel: "   ",
      to: "   ",
      accountId: "   ",
      threadId: "   ",
    });
    expect(result).toBeUndefined();
  });

  it("should return object with undefined field if only one field was present", () => {
    const result = normalizeDeliveryContext({ channel: "   " });
    expect(result).toEqual({ channel: undefined });
  });
});

describe("mergeDeliveryContext", () => {
  it("should return undefined for undefined inputs", () => {
    expect(mergeDeliveryContext(undefined, undefined)).toBeUndefined();
  });

  it("should return primary context when fallback is undefined", () => {
    const primary: DeliveryContext = { channel: "telegram", to: "user1" };
    const result = mergeDeliveryContext(primary, undefined);
    expect(result).toEqual(primary);
  });

  it("should return fallback context when primary is undefined", () => {
    const fallback: DeliveryContext = { channel: "slack", to: "user2" };
    const result = mergeDeliveryContext(undefined, fallback);
    expect(result).toEqual(fallback);
  });

  it("should merge contexts with primary taking precedence", () => {
    const primary: DeliveryContext = { channel: "telegram", to: "user1" };
    const fallback: DeliveryContext = { channel: "slack", to: "user2", accountId: "account1" };
    const result = mergeDeliveryContext(primary, fallback);
    expect(result).toEqual({
      channel: "telegram",
      to: "user1",
      accountId: "account1",
    });
  });

  it("should merge all fields", () => {
    const primary: DeliveryContext = { channel: "telegram" };
    const fallback: DeliveryContext = { to: "user2", accountId: "account1", threadId: "thread1" };
    const result = mergeDeliveryContext(primary, fallback);
    expect(result).toEqual({
      channel: "telegram",
      to: "user2",
      accountId: "account1",
      threadId: "thread1",
    });
  });
});

describe("deliveryContextKey", () => {
  it("should return undefined for undefined input", () => {
    expect(deliveryContextKey(undefined)).toBeUndefined();
  });

  it("should return undefined for context without channel", () => {
    const context: DeliveryContext = { to: "user1" };
    expect(deliveryContextKey(context)).toBeUndefined();
  });

  it("should return undefined for context without to", () => {
    const context: DeliveryContext = { channel: "telegram" };
    expect(deliveryContextKey(context)).toBeUndefined();
  });

  it("should generate key with channel and to", () => {
    const context: DeliveryContext = { channel: "telegram", to: "user1" };
    expect(deliveryContextKey(context)).toBe("telegram|user1||");
  });

  it("should generate key with channel, to, and accountId", () => {
    const context: DeliveryContext = { channel: "telegram", to: "user1", accountId: "account1" };
    expect(deliveryContextKey(context)).toBe("telegram|user1|account1|");
  });

  it("should generate key with all fields", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user1",
      accountId: "account1",
      threadId: "thread1",
    };
    expect(deliveryContextKey(context)).toBe("telegram|user1|account1|thread1");
  });

  it("should handle numeric threadId", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user1",
      accountId: "account1",
      threadId: 123,
    };
    expect(deliveryContextKey(context)).toBe("telegram|user1|account1|123");
  });

  it("should handle empty string threadId", () => {
    const context: DeliveryContext = {
      channel: "telegram",
      to: "user1",
      accountId: "account1",
      threadId: "",
    };
    expect(deliveryContextKey(context)).toBe("telegram|user1|account1|");
  });
});

describe("normalizeSessionDeliveryFields", () => {
  it("should return all undefined values for undefined input", () => {
    const result = normalizeSessionDeliveryFields(undefined);
    expect(result).toEqual({
      deliveryContext: undefined,
      lastChannel: undefined,
      lastTo: undefined,
      lastAccountId: undefined,
      lastThreadId: undefined,
    });
  });

  it("should normalize deliveryContext and other fields", () => {
    const source: DeliveryContextSessionSource = {
      deliveryContext: { channel: " telegram ", to: " user1 " },
      lastChannel: " slack ",
      lastTo: " user2 ",
      lastAccountId: " account1 ",
      lastThreadId: " thread1 ",
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result).toEqual({
      deliveryContext: { channel: "telegram", to: "user1" },
      lastChannel: "telegram",
      lastTo: "user1",
      lastAccountId: "account1",
      lastThreadId: "thread1",
    });
  });

  it("should prioritize channel over lastChannel", () => {
    const source: DeliveryContextSessionSource = {
      channel: "telegram",
      lastChannel: "slack",
      lastAccountId: "account1",
      deliveryContext: { accountId: "account2" },
    };
    const result = normalizeSessionDeliveryFields(source);
    expect(result).toEqual({
      deliveryContext: { channel: "telegram", accountId: "account2" },
      lastChannel: "telegram",
      lastTo: undefined,
      lastAccountId: "account2",
      lastThreadId: undefined,
    });
  });
});

describe("deliveryContextFromSession", () => {
  it("should return undefined for undefined input", () => {
    expect(deliveryContextFromSession(undefined)).toBeUndefined();
  });

  it("should extract delivery context from session", () => {
    const entry = {
      deliveryContext: { channel: "telegram", to: "user1" },
      lastChannel: "slack",
      lastTo: "user2",
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({ channel: "telegram", to: "user1" });
  });

  it("should use origin threadId if lastThreadId is undefined", () => {
    const entry = {
      deliveryContext: { channel: "telegram", to: "user1" },
      lastChannel: "slack",
      lastTo: "user2",
      origin: { threadId: "thread1" },
    };
    const result = deliveryContextFromSession(entry);
    expect(result).toEqual({ channel: "telegram", to: "user1" });
  });
});
