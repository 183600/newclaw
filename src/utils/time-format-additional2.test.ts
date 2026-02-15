import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "./time-format.js";

describe("formatRelativeTime - Additional Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should handle timestamps at exact boundaries", () => {
    const now = Date.now();

    // Test exactly 59 seconds ago
    vi.setSystemTime(now);
    const timestamp59s = now - 59 * 1000;
    expect(formatRelativeTime(timestamp59s)).toBe("just now");

    // Test exactly 60 seconds ago
    const timestamp60s = now - 60 * 1000;
    expect(formatRelativeTime(timestamp60s)).toBe("1m ago");

    // Test exactly 59 minutes ago
    const timestamp59m = now - 59 * 60 * 1000;
    expect(formatRelativeTime(timestamp59m)).toBe("59m ago");

    // Test exactly 60 minutes ago
    const timestamp60m = now - 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp60m)).toBe("1h ago");

    // Test exactly 23 hours ago
    const timestamp23h = now - 23 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp23h)).toBe("23h ago");

    // Test exactly 24 hours ago
    const timestamp24h = now - 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp24h)).toBe("Yesterday");

    // Test exactly 6 days ago
    const timestamp6d = now - 6 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp6d)).toBe("6d ago");

    // Test exactly 7 days ago
    const timestamp7d = now - 7 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp7d)).toBe("7d ago");

    // Test exactly 8 days ago
    const timestamp8d = now - 8 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp8d)).toBe(
      new Date(timestamp8d).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should handle very small time differences", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test 1 millisecond ago
    const timestamp1ms = now - 1;
    expect(formatRelativeTime(timestamp1ms)).toBe("just now");

    // Test 100 milliseconds ago
    const timestamp100ms = now - 100;
    expect(formatRelativeTime(timestamp100ms)).toBe("just now");

    // Test 999 milliseconds ago
    const timestamp999ms = now - 999;
    expect(formatRelativeTime(timestamp999ms)).toBe("just now");
  });

  it("should handle very large time differences", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test 1 year ago
    const timestamp1y = now - 365 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp1y)).toBe(
      new Date(timestamp1y).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );

    // Test 10 years ago
    const timestamp10y = now - 10 * 365 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(timestamp10y)).toBe(
      new Date(timestamp10y).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should handle edge case timestamps near Date limits", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test very close to max safe date
    const nearMaxDate = 8.64e15 - 1000;
    expect(formatRelativeTime(nearMaxDate)).toBe("Sep 12");

    // Test very close to min safe date
    const nearMinDate = -8.64e15 + 1000;
    expect(formatRelativeTime(nearMinDate)).toBe("Apr 20");
  });

  it("should handle timestamps with decimal values", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test with decimal timestamp
    const timestampDecimal = now - 90.5 * 1000;
    expect(formatRelativeTime(timestampDecimal)).toBe("1m ago");
  });

  it("should handle negative timestamps within safe range", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test negative timestamp (before epoch)
    const timestampNegative = -1000 * 60 * 60; // 1 hour before epoch
    expect(formatRelativeTime(timestampNegative)).toBe(
      new Date(timestampNegative).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should handle timestamps that result in zero values", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test timestamp that results in exactly 0 seconds
    const timestampZero = now;
    expect(formatRelativeTime(timestampZero)).toBe("just now");
  });
});
