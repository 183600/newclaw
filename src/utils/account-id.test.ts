import { describe, it, expect } from "vitest";
import { normalizeAccountId } from "./account-id";

describe("normalizeAccountId", () => {
  it("should return undefined for non-string values", () => {
    expect(normalizeAccountId(undefined)).toBeUndefined();
    expect(normalizeAccountId(null)).toBeUndefined();
    expect(normalizeAccountId(123)).toBeUndefined();
    expect(normalizeAccountId({})).toBeUndefined();
    expect(normalizeAccountId([])).toBeUndefined();
  });

  it("should return undefined for empty strings", () => {
    expect(normalizeAccountId("")).toBeUndefined();
    expect(normalizeAccountId("   ")).toBeUndefined();
    expect(normalizeAccountId("\t\n")).toBeUndefined();
  });

  it("should return trimmed string for valid account IDs", () => {
    expect(normalizeAccountId("user123")).toBe("user123");
    expect(normalizeAccountId("  user123  ")).toBe("user123");
    expect(normalizeAccountId("\tuser123\n")).toBe("user123");
    expect(normalizeAccountId(" user-with-dash ")).toBe("user-with-dash");
    expect(normalizeAccountId("user_with_underscore")).toBe("user_with_underscore");
  });

  it("should preserve internal spacing in account IDs", () => {
    expect(normalizeAccountId("user 123")).toBe("user 123");
    expect(normalizeAccountId("  user   123  ")).toBe("user   123");
  });

  it("should handle special characters", () => {
    expect(normalizeAccountId("user@domain.com")).toBe("user@domain.com");
    expect(normalizeAccountId("  user@domain.com  ")).toBe("user@domain.com");
    expect(normalizeAccountId("user+tag@example.com")).toBe("user+tag@example.com");
  });
});
