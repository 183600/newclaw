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

describe("delivery-context - Additional Tests", () => {
  describe("normalizeDeliveryContext", () => {
    it("should handle threadId with decimal values", () => {
      const context = { threadId: 123.789 };
      const result = normalizeDeliveryContext(context);
      expect(result?.threadId).toBe(123);
    });

    it("should handle threadId with negative values", () => {
      const context = { threadId: -456 };
      const result = normalizeDeliveryContext(context);
      expect(result?.threadId).toBe(-456);
    });

    it("should handle threadId with very large values", () => {
      const context = { threadId: Number.MAX_SAFE_INTEGER };
      const result = normalizeDeliveryContext(context);
      expect(result?.threadId).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should handle accountId with special characters", () => {
      const context = { accountId: "user-123_456@domain" };
      const result = normalizeDeliveryContext(context);
      expect(result?.accountId).toBe("user-123_456@domain");
    });

    it("should handle to field with emoji", () => {
      const context = { to: "user🎉123" };
      const result = normalizeDeliveryContext(context);
      expect(result?.to).toBe("user🎉123");
    });

    it("should handle channel with mixed case", () => {
      const context = { channel: "TeLeGrAm" };
      const result = normalizeDeliveryContext(context);
      expect(result?.channel).toBe("telegram");
    });
  });

  describe("mergeDeliveryContext", () => {
    it("should handle merging with undefined fields", () => {
      const primary: DeliveryContext = { channel: "telegram", to: undefined };
      const fallback: DeliveryContext = { channel: undefined, to: "user1" };
      const result = mergeDeliveryContext(primary, fallback);
      expect(result).toEqual({
        channel: "telegram",
        to: "user1",
      });
    });

    it("should handle merging with empty objects", () => {
      const primary: DeliveryContext = {};
      const fallback: DeliveryContext = { channel: "telegram", to: "user1" };
      const result = mergeDeliveryContext(primary, fallback);
      expect(result).toEqual({
        channel: "telegram",
        to: "user1",
      });
    });

    it("should handle merging with conflicting fields", () => {
      const primary: DeliveryContext = { channel: "telegram", to: "user1" };
      const fallback: DeliveryContext = { channel: "discord", to: "user2" };
      const result = mergeDeliveryContext(primary, fallback);
      expect(result).toEqual({
        channel: "telegram",
        to: "user1",
      });
    });
  });

  describe("deliveryContextKey", () => {
    it("should handle threadId with special characters", () => {
      const context: DeliveryContext = {
        channel: "telegram",
        to: "user1",
        threadId: "thread-123_456",
      };
      const result = deliveryContextKey(context);
      expect(result).toBe("telegram|user1||thread-123_456");
    });

    it("should handle accountId with special characters", () => {
      const context: DeliveryContext = {
        channel: "telegram",
        to: "user1",
        accountId: "acc-123_456@domain",
      };
      const result = deliveryContextKey(context);
      expect(result).toBe("telegram|user1|acc-123_456@domain|");
    });

    it("should handle numeric threadId", () => {
      const context: DeliveryContext = {
        channel: "telegram",
        to: "user1",
        threadId: 123,
      };
      const result = deliveryContextKey(context);
      expect(result).toBe("telegram|user1||123");
    });

    it("should handle threadId of 0", () => {
      const context: DeliveryContext = {
        channel: "telegram",
        to: "user1",
        threadId: 0,
      };
      const result = deliveryContextKey(context);
      expect(result).toBe("telegram|user1||0");
    });
  });

  describe("normalizeSessionDeliveryFields", () => {
    it("should handle session with only last fields", () => {
      const source: DeliveryContextSessionSource = {
        lastChannel: "telegram",
        lastTo: "user1",
        lastAccountId: "acc1",
        lastThreadId: "thread1",
      };
      const result = normalizeSessionDeliveryFields(source);
      expect(result).toEqual({
        deliveryContext: {
          channel: "telegram",
          to: "user1",
          accountId: "acc1",
          threadId: "thread1",
        },
        lastChannel: "telegram",
        lastTo: "user1",
        lastAccountId: "acc1",
        lastThreadId: "thread1",
      });
    });

    it("should handle session with mixed valid and invalid fields", () => {
      const source: DeliveryContextSessionSource = {
        channel: "telegram",
        lastChannel: "",
        lastTo: "  ",
        lastAccountId: null,
        lastThreadId: undefined,
        deliveryContext: {
          channel: "discord",
          to: "user2",
          accountId: "acc2",
          threadId: "thread2",
        },
      };
      const result = normalizeSessionDeliveryFields(source);
      expect(result).toEqual({
        deliveryContext: {
          channel: "discord",
          to: "user2",
          accountId: "acc2",
          threadId: "thread2",
        },
        lastChannel: "discord",
        lastTo: "user2",
        lastAccountId: "acc2",
        lastThreadId: "thread2",
      });
    });
  });

  describe("deliveryContextFromSession", () => {
    it("should handle session with origin data", () => {
      const entry = {
        deliveryContext: { channel: "telegram", to: "user1" },
        origin: { threadId: "origin-thread" },
      };
      const result = deliveryContextFromSession(entry);
      expect(result).toEqual({
        channel: "telegram",
        to: "user1",
      });
    });

    it("should handle session with complex delivery context", () => {
      const entry = {
        deliveryContext: {
          channel: "telegram",
          to: "user1",
          accountId: "acc1",
          threadId: "thread1",
        },
      };
      const result = deliveryContextFromSession(entry);
      expect(result).toEqual({
        channel: "telegram",
        to: "user1",
        accountId: "acc1",
        threadId: "thread1",
      });
    });
  });
});
