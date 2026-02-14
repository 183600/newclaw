import { describe, expect, it } from "vitest";
import { normalizeAccountId } from "./account-id.js";

describe("normalizeAccountId", () => {
  it("should return undefined for undefined input", () => {
    expect(normalizeAccountId(undefined)).toBeUndefined();
  });

  it("should return undefined for null input", () => {
    expect(normalizeAccountId(null)).toBeUndefined();
  });

  it("should return undefined for non-string input", () => {
    expect(normalizeAccountId(123)).toBeUndefined();
    expect(normalizeAccountId({})).toBeUndefined();
    expect(normalizeAccountId([])).toBeUndefined();
    expect(normalizeAccountId(true)).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(normalizeAccountId("")).toBeUndefined();
  });

  it("should return undefined for whitespace-only string", () => {
    expect(normalizeAccountId("   ")).toBeUndefined();
    expect(normalizeAccountId("\t\n")).toBeUndefined();
    expect(normalizeAccountId("  \t  \n  ")).toBeUndefined();
  });

  it("should return trimmed string for valid input", () => {
    expect(normalizeAccountId("account123")).toBe("account123");
  });

  it("should trim whitespace from string", () => {
    expect(normalizeAccountId("  account123  ")).toBe("account123");
    expect(normalizeAccountId("\taccount123\n")).toBe("account123");
    expect(normalizeAccountId("  \t  account123  \n  ")).toBe("account123");
  });

  it("should preserve inner whitespace", () => {
    expect(normalizeAccountId("account 123")).toBe("account 123");
    expect(normalizeAccountId("  account 123  ")).toBe("account 123");
  });

  it("should handle special characters", () => {
    expect(normalizeAccountId("account-123_456")).toBe("account-123_456");
    expect(normalizeAccountId("  account-123_456  ")).toBe("account-123_456");
  });

  it("should handle email-like strings", () => {
    expect(normalizeAccountId("user@example.com")).toBe("user@example.com");
    expect(normalizeAccountId("  user@example.com  ")).toBe("user@example.com");
  });

  it("should handle numeric strings", () => {
    expect(normalizeAccountId("12345")).toBe("12345");
    expect(normalizeAccountId("  12345  ")).toBe("12345");
  });
});
