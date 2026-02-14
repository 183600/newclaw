import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "./time-format.js";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return fallback format for invalid timestamps", () => {
    expect(formatRelativeTime(NaN)).toBe("Jan 1");
    expect(formatRelativeTime(Infinity)).toBe("Jan 1");
    expect(formatRelativeTime(-Infinity)).toBe("Jan 1");
  });

  it("should return fallback format for extreme timestamps", () => {
    const maxSafeDate = 8.64e15;
    const minSafeDate = -8.64e15;

    expect(formatRelativeTime(maxSafeDate + 1)).toBe("Jan 1");
    expect(formatRelativeTime(minSafeDate - 1)).toBe("Jan 1");
  });

  it("should return date format for future timestamps", () => {
    const now = Date.now();
    const future = now + 1000 * 60 * 60 * 24; // 1 day in future
    vi.setSystemTime(now);

    const result = formatRelativeTime(future);
    expect(result).toBe(
      new Date(future).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should return 'just now' for timestamps less than 1 minute ago", () => {
    const now = Date.now();
    const timestamp = now - 30 * 1000; // 30 seconds ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("just now");
  });

  it("should return 'Xm ago' for timestamps less than 1 hour ago", () => {
    const now = Date.now();
    const timestamp = now - 30 * 60 * 1000; // 30 minutes ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("30m ago");
  });

  it("should return '1m ago' for timestamps 1 minute ago", () => {
    const now = Date.now();
    const timestamp = now - 60 * 1000; // 1 minute ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("1m ago");
  });

  it("should return 'Xh ago' for timestamps less than 1 day ago", () => {
    const now = Date.now();
    const timestamp = now - 5 * 60 * 60 * 1000; // 5 hours ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("5h ago");
  });

  it("should return '1h ago' for timestamps 1 hour ago", () => {
    const now = Date.now();
    const timestamp = now - 60 * 60 * 1000; // 1 hour ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("1h ago");
  });

  it("should return 'Yesterday' for timestamps 1 day ago", () => {
    const now = Date.now();
    const timestamp = now - 24 * 60 * 60 * 1000; // 1 day ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("Yesterday");
  });

  it("should return 'Xd ago' for timestamps less than 7 days ago", () => {
    const now = Date.now();
    const timestamp = now - 3 * 24 * 60 * 60 * 1000; // 3 days ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("3d ago");
  });

  it("should return '7d ago' for timestamps 7 days ago", () => {
    const now = Date.now();
    const timestamp = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("7d ago");
  });

  it("should return date format for timestamps 7 days or more ago", () => {
    const now = Date.now();
    const timestamp = now - 10 * 24 * 60 * 60 * 1000; // 10 days ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe(
      new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should handle edge case at exactly 60 seconds", () => {
    const now = Date.now();
    const timestamp = now - 60 * 1000; // Exactly 60 seconds ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("1m ago");
  });

  it("should handle edge case at exactly 60 minutes", () => {
    const now = Date.now();
    const timestamp = now - 60 * 60 * 1000; // Exactly 60 minutes ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("1h ago");
  });

  it("should handle edge case at exactly 24 hours", () => {
    const now = Date.now();
    const timestamp = now - 24 * 60 * 60 * 1000; // Exactly 24 hours ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("Yesterday");
  });

  it("should handle edge case at exactly 7 days", () => {
    const now = Date.now();
    const timestamp = now - 7 * 24 * 60 * 60 * 1000; // Exactly 7 days ago
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe("7d ago");
  });

  it("should handle timestamp of 0", () => {
    const now = Date.now();
    vi.setSystemTime(now);

    const result = formatRelativeTime(0);
    expect(result).toBe(
      new Date(0).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });

  it("should handle negative timestamp", () => {
    const now = Date.now();
    const timestamp = -1000; // 1 second before epoch
    vi.setSystemTime(now);

    const result = formatRelativeTime(timestamp);
    expect(result).toBe(
      new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  });
});
