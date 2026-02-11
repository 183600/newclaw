import { describe, expect, it, vi } from "vitest";
import {
  pickTagline,
  activeTaglines,
  DEFAULT_TAGLINE,
  TAGLINES,
  HOLIDAY_TAGLINES,
} from "./tagline.js";

describe("pickTagline", () => {
  it("should return a tagline from the available pool", () => {
    const tagline = pickTagline();
    expect(TAGLINES).toContain(tagline);
  });

  it("should return default tagline when no taglines are available", () => {
    const originalTaglines = [...TAGLINES];
    TAGLINES.length = 0; // Empty the array

    const tagline = pickTagline();
    expect(tagline).toBe(DEFAULT_TAGLINE);

    TAGLINES.push(...originalTaglines); // Restore
  });

  it("should use custom random function when provided", () => {
    const mockRandom = vi.fn(() => 0.5);
    const tagline = pickTagline({ random: mockRandom });

    expect(mockRandom).toHaveBeenCalled();
    expect(TAGLINES).toContain(tagline);
  });

  it("should handle environment override for tagline index", () => {
    const env = { OPENCLAW_TAGLINE_INDEX: "0" };
    const tagline = pickTagline({ env });

    expect(tagline).toBe(TAGLINES[0]);
  });

  it("should handle out-of-bounds environment override", () => {
    const env = { OPENCLAW_TAGLINE_INDEX: "999999" };
    const tagline = pickTagline({ env });

    expect(TAGLINES).toContain(tagline);
  });

  it("should handle invalid environment override", () => {
    const env = { OPENCLAW_TAGLINE_INDEX: "invalid" };
    const tagline = pickTagline({ env });

    expect(TAGLINES).toContain(tagline);
  });

  it("should use custom date function when provided", () => {
    const mockDate = new Date("2025-01-01");
    const tagline = pickTagline({ now: () => mockDate });

    expect(TAGLINES).toContain(tagline);
  });
});

describe("activeTaglines", () => {
  it("should return all taglines when no date restrictions apply", () => {
    const active = activeTaglines();
    expect(active.length).toBeGreaterThan(0);
    expect(active.every((tagline) => TAGLINES.includes(tagline))).toBe(true);
  });

  it("should return default tagline when no taglines are available", () => {
    const originalTaglines = [...TAGLINES];
    TAGLINES.length = 0; // Empty the array

    const active = activeTaglines();
    expect(active).toEqual([DEFAULT_TAGLINE]);

    TAGLINES.push(...originalTaglines); // Restore
  });

  it("should filter taglines based on date", () => {
    const newYearDate = new Date("2025-01-01");
    const active = activeTaglines({ now: () => newYearDate });

    expect(active).toContain(HOLIDAY_TAGLINES.newYear);
    expect(active.length).toBeGreaterThan(0);
  });

  it("should handle Christmas date", () => {
    const christmasDate = new Date("2025-12-25");
    const active = activeTaglines({ now: () => christmasDate });

    expect(active).toContain(HOLIDAY_TAGLINES.christmas);
  });

  it("should handle Halloween date", () => {
    const halloweenDate = new Date("2025-10-31");
    const active = activeTaglines({ now: () => halloweenDate });

    expect(active).toContain(HOLIDAY_TAGLINES.halloween);
  });

  it("should handle Valentine's Day date", () => {
    const valentinesDate = new Date("2025-02-14");
    const active = activeTaglines({ now: () => valentinesDate });

    expect(active).toContain(HOLIDAY_TAGLINES.valentines);
  });

  it("should handle Thanksgiving (fourth Thursday of November)", () => {
    // 2025 Thanksgiving is November 27, 2025
    const thanksgivingDate = new Date("2025-11-27");
    const active = activeTaglines({ now: () => thanksgivingDate });

    expect(active).toContain(HOLIDAY_TAGLINES.thanksgiving);
  });

  it("should handle Lunar New Year dates", () => {
    // 2025 Lunar New Year is January 29, 2025
    const lunarNewYearDate = new Date("2025-01-29");
    const active = activeTaglines({ now: () => lunarNewYearDate });

    expect(active).toContain(HOLIDAY_TAGLINES.lunarNewYear);
  });

  it("should handle non-holiday dates", () => {
    const regularDate = new Date("2025-06-15");
    const active = activeTaglines({ now: () => regularDate });

    expect(
      active.every((tagline) => !Object.values(HOLIDAY_TAGLINES).includes(tagline as any)),
    ).toBe(true);
  });
});

describe("holiday taglines", () => {
  it("should include all expected holiday taglines", () => {
    const holidayTaglines = Object.values(HOLIDAY_TAGLINES);

    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.newYear);
    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.christmas);
    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.halloween);
    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.valentines);
    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.thanksgiving);
    expect(holidayTaglines).toContain(HOLIDAY_TAGLINES.lunarNewYear);
  });

  it("should have unique holiday taglines", () => {
    const holidayTaglines = Object.values(HOLIDAY_TAGLINES);
    const uniqueTaglines = new Set(holidayTaglines);

    expect(uniqueTaglines.size).toBe(holidayTaglines.length);
  });
});
