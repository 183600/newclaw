import { describe, expect, it } from "vitest";
import { normalizeVoiceWakeTriggers, formatError } from "./server-utils.js";

describe("Gateway Server Utils", () => {
  describe("normalizeVoiceWakeTriggers", () => {
    it("returns default triggers for empty input", () => {
      const result = normalizeVoiceWakeTriggers(undefined);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns default triggers for null input", () => {
      const result = normalizeVoiceWakeTriggers(null);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns default triggers for non-array input", () => {
      const result = normalizeVoiceWakeTriggers("not an array");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("processes valid string array", () => {
      const input = ["hello", "world", "test"];
      const result = normalizeVoiceWakeTriggers(input);
      expect(result).toEqual(["hello", "world", "test"]);
    });

    it("trims whitespace from strings", () => {
      const input = ["  hello  ", "world", "  test  "];
      const result = normalizeVoiceWakeTriggers(input);
      expect(result).toEqual(["hello", "world", "test"]);
    });

    it("filters out non-string values", () => {
      const input = ["hello", 123, null, undefined, "world", {}, []];
      const result = normalizeVoiceWakeTriggers(input);
      expect(result).toEqual(["hello", "world"]);
    });

    it("filters out empty strings", () => {
      const input = ["hello", "", "world", "   ", "test"];
      const result = normalizeVoiceWakeTriggers(input);
      expect(result).toEqual(["hello", "world", "test"]);
    });

    it("limits to 32 triggers", () => {
      const input = Array.from({ length: 50 }, (_, i) => `trigger${i}`);
      const result = normalizeVoiceWakeTriggers(input);
      expect(result).toHaveLength(32);
      expect(result[0]).toBe("trigger0");
      expect(result[31]).toBe("trigger31");
    });

    it("triggers to 64 characters max", () => {
      const longTrigger = "a".repeat(100);
      const input = [longTrigger, "normal"];
      const result = normalizeVoiceWakeTriggers(input);
      expect(result[0]).toHaveLength(64);
      expect(result[1]).toBe("normal");
    });
  });

  describe("formatError", () => {
    it("formats Error objects", () => {
      const error = new Error("Test error message");
      const result = formatError(error);
      expect(result).toBe("Test error message");
    });

    it("formats string errors", () => {
      const error = "String error message";
      const result = formatError(error);
      expect(result).toBe("String error message");
    });

    it("formats objects with status and code", () => {
      const error = { status: 404, code: "NOT_FOUND" };
      const result = formatError(error);
      expect(result).toBe("status=404 code=NOT_FOUND");
    });

    it("formats objects with only status", () => {
      const error = { status: 500 };
      const result = formatError(error);
      expect(result).toBe("status=500 code=unknown");
    });

    it("formats objects with only code", () => {
      const error = { code: "ERROR_CODE" };
      const result = formatError(error);
      expect(result).toBe("status=unknown code=ERROR_CODE");
    });

    it("handles numeric status and code", () => {
      const error = { status: 404, code: 1234 };
      const result = formatError(error);
      expect(result).toBe("status=404 code=1234");
    });

    it("stringifies complex objects", () => {
      const error = { complex: { nested: { object: "value" } } };
      const result = formatError(error);
      expect(result).toBe(JSON.stringify(error, null, 2));
    });

    it("handles circular references gracefully", () => {
      const error: { name: string; self?: unknown } = { name: "circular" };
      error.self = error;

      // Should not throw an error
      const result = formatError(error);
      expect(typeof result).toBe("string");
    });

    it("handles null and undefined", () => {
      expect(formatError(null)).toBe("null");
      expect(formatError(undefined)).toBeUndefined(); // JSON.stringify(undefined) returns undefined
    });

    it("handles numbers and booleans", () => {
      expect(formatError(123)).toBe("123");
      expect(formatError(true)).toBe("true");
      expect(formatError(false)).toBe("false");
    });
  });
});
