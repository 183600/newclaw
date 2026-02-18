import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "./time-format.js";

describe("formatRelativeTime - Additional Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handles null and undefined timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(null as unknown)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime(undefined as unknown)).toMatch(/^[A-Za-z]{3} \d+$/);
  });

  it("handles string timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime("1234567890" as unknown)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime("invalid" as unknown)).toMatch(/^[A-Za-z]{3} \d+$/);
  });

  it("handles extremely large positive timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Beyond JavaScript Date safe range
    const extremeFuture = 9e15;
    expect(formatRelativeTime(extremeFuture)).toBe("Jan 1");
  });

  it("handles extremely large negative timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Beyond JavaScript Date safe range
    const extremePast = -9e15;
    expect(formatRelativeTime(extremePast)).toBe("Jan 1");
  });

  it("handles timestamps at the edge of JavaScript Date range", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // At the edge of what JavaScript Date can handle
    const maxSafeDate = 8.64e15;
    const minSafeDate = -8.64e15;

    expect(formatRelativeTime(maxSafeDate)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime(minSafeDate)).toMatch(/^[A-Za-z]{3} \d+$/);
  });

  it("handles NaN timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(NaN)).toMatch(/^[A-Za-z]{3} \d+$/);
  });

  it("handles Infinity timestamps", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(Infinity)).toBe("Jan 1");
    expect(formatRelativeTime(-Infinity)).toBe("Jan 1");
  });

  it("handles timestamps that are exactly at boundaries", () => {
    const now = new Date("2023-12-15T12:00:00Z").getTime();
    vi.setSystemTime(now);

    // Test exact second boundaries
    expect(formatRelativeTime(now - 1000)).toBe("just now"); // Exactly 1 second
    expect(formatRelativeTime(now - 59999)).toBe("just now"); // 1 millisecond before 1 minute
    expect(formatRelativeTime(now - 60000)).toBe("1m ago"); // Exactly 1 minute
    expect(formatRelativeTime(now - 3599999)).toBe("59m ago"); // 1 millisecond before 1 hour
    expect(formatRelativeTime(now - 3600000)).toBe("1h ago"); // Exactly 1 hour
    expect(formatRelativeTime(now - 86399999)).toBe("23h ago"); // 1 millisecond before 1 day
    expect(formatRelativeTime(now - 86400000)).toBe("Yesterday"); // Exactly 1 day
    expect(formatRelativeTime(now - 172799999)).toBe("Yesterday"); // 1.999 days, still "Yesterday"
    expect(formatRelativeTime(now - 172800000)).toBe("2d ago"); // Exactly 2 days
    expect(formatRelativeTime(now - 604799999)).toBe("6d ago"); // 1 millisecond before 7 days
    expect(formatRelativeTime(now - 604800000)).toBe("7d ago"); // Exactly 7 days
  });

  it("handles timestamps with milliseconds precision", () => {
    const now = new Date("2023-12-15T12:00:00.500Z").getTime();
    vi.setSystemTime(now);

    // Test with millisecond precision
    expect(formatRelativeTime(now - 1500)).toBe("just now"); // 1.5 seconds ago
    expect(formatRelativeTime(now - 30500)).toBe("just now"); // 30.5 seconds ago
    expect(formatRelativeTime(now - 90500)).toBe("1m ago"); // 90.5 seconds ago
    expect(formatRelativeTime(now - 1805000)).toBe("30m ago"); // 30.5 minutes ago
    expect(formatRelativeTime(now - 3605000)).toBe("1h ago"); // 60.5 minutes ago
    expect(formatRelativeTime(now - 7205000)).toBe("2h ago"); // 120.5 minutes ago
  });

  it("handles leap year timestamps", () => {
    // Set system time to a leap year
    const leapYearTime = new Date("2024-02-29T12:00:00Z").getTime();
    vi.setSystemTime(leapYearTime);

    expect(formatRelativeTime(leapYearTime - 86400000)).toBe("Yesterday");
    expect(formatRelativeTime(leapYearTime - 172800000)).toBe("2d ago");
  });

  it("handles daylight saving time transitions", () => {
    // Note: This test might behave differently depending on the timezone
    // but we're using UTC timestamps so it should be consistent
    const dstTransition = new Date("2023-03-12T12:00:00Z").getTime(); // DST start in US
    vi.setSystemTime(dstTransition);

    expect(formatRelativeTime(dstTransition - 3600000)).toBe("1h ago");
    expect(formatRelativeTime(dstTransition - 86400000)).toBe("Yesterday");
  });

  it("handles very precise time differences", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test with very small differences
    expect(formatRelativeTime(now - 1)).toBe("just now");
    expect(formatRelativeTime(now - 100)).toBe("just now");
    expect(formatRelativeTime(now - 500)).toBe("just now");
    expect(formatRelativeTime(now - 999)).toBe("just now");
  });

  it("handles timestamps far in the future", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test with future timestamps
    const oneHourFuture = now + 3600000;
    const oneDayFuture = now + 86400000;
    const oneWeekFuture = now + 604800000;
    const oneYearFuture = now + 31536000000;

    expect(formatRelativeTime(oneHourFuture)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime(oneDayFuture)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime(oneWeekFuture)).toMatch(/^[A-Za-z]{3} \d+$/);
    expect(formatRelativeTime(oneYearFuture)).toMatch(/^[A-Za-z]{3} \d+$/);
  });

  it("handles timestamps with different locales", () => {
    const now = new Date("2023-12-15T12:00:00Z").getTime();
    vi.setSystemTime(now);

    // The function uses toLocaleDateString with undefined locale
    // so it should use the system's default locale
    // We can't test specific locale formatting, but we can test that it returns something
    const oldDate = now - 10 * 24 * 60 * 60 * 1000; // 10 days ago
    const result = formatRelativeTime(oldDate);
    expect(result).toMatch(/^[A-Za-z]{3} \d+$/); // Should be in "M D" format
  });

  it("handles timestamps at year boundaries", () => {
    // Test across year boundary
    const newYear = new Date("2024-01-01T12:00:00Z").getTime();
    vi.setSystemTime(newYear);

    const lastYear = newYear - 86400000; // Yesterday (last year)
    expect(formatRelativeTime(lastYear)).toBe("Yesterday");

    const weekAgo = newYear - 7 * 86400000; // 1 week ago (last year)
    const result = formatRelativeTime(weekAgo);
    expect(result).toBe("7d ago"); // 7 days ago should show "7d ago" regardless of year boundary
  });

  it("handles timestamps with very small system time changes", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Advance time by a small amount
    vi.advanceTimersByTime(1);

    // The relative time should still be "just now" for very recent timestamps
    expect(formatRelativeTime(now - 100)).toBe("just now");
  });

  it("handles negative zero", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Negative zero should be treated as zero
    expect(formatRelativeTime(-0)).toMatch(/^[A-Za-z]{3} \d+$/);
  });
});
