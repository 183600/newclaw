import { describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./time-format.js";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for timestamps less than 1 minute ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(now - 30 * 1000)).toBe("just now"); // 30 seconds ago
    expect(formatRelativeTime(now - 59 * 1000)).toBe("just now"); // 59 seconds ago
  });

  it("returns 'Xm ago' for timestamps less than 1 hour ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(now - 60 * 1000)).toBe("1m ago"); // 1 minute ago
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5m ago"); // 5 minutes ago
    expect(formatRelativeTime(now - 59 * 60 * 1000)).toBe("59m ago"); // 59 minutes ago
  });

  it("returns 'Xh ago' for timestamps less than 1 day ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(now - 60 * 60 * 1000)).toBe("1h ago"); // 1 hour ago
    expect(formatRelativeTime(now - 5 * 60 * 60 * 1000)).toBe("5h ago"); // 5 hours ago
    expect(formatRelativeTime(now - 23 * 60 * 60 * 1000)).toBe("23h ago"); // 23 hours ago
  });

  it("returns 'Yesterday' for timestamps 1 day ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(now - 24 * 60 * 60 * 1000)).toBe("Yesterday"); // 24 hours ago
    expect(formatRelativeTime(now - 47 * 60 * 60 * 1000)).toBe("Yesterday"); // 47 hours ago
  });

  it("returns 'Xd ago' for timestamps less than 7 days ago", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    expect(formatRelativeTime(now - 48 * 60 * 60 * 1000)).toBe("2d ago"); // 2 days ago
    expect(formatRelativeTime(now - 5 * 24 * 60 * 60 * 1000)).toBe("5d ago"); // 5 days ago
    expect(formatRelativeTime(now - 6 * 24 * 60 * 60 * 1000)).toBe("6d ago"); // 6 days ago
  });

  it("returns formatted date for timestamps 7+ days ago", () => {
    const now = new Date("2023-12-15T12:00:00Z").getTime();
    vi.setSystemTime(now);

    // Test different dates
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const weekAgoDate = new Date(weekAgo);
    const twoWeeksAgoDate = new Date(twoWeeksAgo);
    const monthAgoDate = new Date(monthAgo);

    expect(formatRelativeTime(weekAgo)).toBe(
      weekAgoDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
    expect(formatRelativeTime(twoWeeksAgo)).toBe(
      twoWeeksAgoDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
    expect(formatRelativeTime(monthAgo)).toBe(
      monthAgoDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("handles edge cases correctly", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Test exact boundaries
    expect(formatRelativeTime(now)).toBe("just now"); // Current time
    expect(formatRelativeTime(now - 60 * 1000)).toBe("1m ago"); // Exactly 1 minute
    expect(formatRelativeTime(now - 60 * 60 * 1000)).toBe("1h ago"); // Exactly 1 hour
    expect(formatRelativeTime(now - 24 * 60 * 60 * 1000)).toBe("Yesterday"); // Exactly 1 day
    expect(formatRelativeTime(now - 7 * 24 * 60 * 60 * 1000)).toMatch(/^[A-Za-z]{3} \d+$/); // Exactly 7 days
  });

  it("handles future timestamps gracefully", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    // Future timestamps should still return formatted date
    const future = now + 60 * 1000; // 1 minute in future
    const futureDate = new Date(future);

    expect(formatRelativeTime(future)).toBe(
      futureDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("handles very old timestamps", () => {
    const now = new Date("2023-12-15T12:00:00Z").getTime();
    vi.setSystemTime(now);

    // Test very old timestamp (1 year ago)
    const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const yearAgoDate = new Date(yearAgo);

    expect(formatRelativeTime(yearAgo)).toBe(
      yearAgoDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("handles timestamp 0", () => {
    const now = new Date("2023-12-15T12:00:00Z").getTime();
    vi.setSystemTime(now);

    const epochDate = new Date(0);
    expect(formatRelativeTime(0)).toBe(
      epochDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("works with different system times", () => {
    // Test with a specific date
    const testTime = new Date("2023-06-15T10:30:00Z").getTime();
    vi.setSystemTime(testTime);

    // Test various relative times from this specific point
    expect(formatRelativeTime(testTime - 30 * 1000)).toBe("just now");
    expect(formatRelativeTime(testTime - 2 * 60 * 1000)).toBe("2m ago");
    expect(formatRelativeTime(testTime - 3 * 60 * 60 * 1000)).toBe("3h ago");
    expect(formatRelativeTime(testTime - 24 * 60 * 60 * 1000)).toBe("Yesterday");
    expect(formatRelativeTime(testTime - 3 * 24 * 60 * 60 * 1000)).toBe("3d ago");
  });
});
