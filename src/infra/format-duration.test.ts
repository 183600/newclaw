import { describe, expect, it } from "vitest";
import { formatDurationMs, formatDurationSeconds } from "./format-duration.js";

describe("formatDurationSeconds", () => {
  it("formats milliseconds to seconds with default options", () => {
    expect(formatDurationSeconds(1000)).toBe("1s");
    expect(formatDurationSeconds(1500)).toBe("1.5s");
    expect(formatDurationSeconds(1234)).toBe("1.2s");
  });

  it("handles zero duration", () => {
    expect(formatDurationSeconds(0)).toBe("0s");
  });

  it("handles negative values by clamping to zero", () => {
    expect(formatDurationSeconds(-1000)).toBe("0s");
    expect(formatDurationSeconds(-500)).toBe("0s");
  });

  it("respects decimal places option", () => {
    expect(formatDurationSeconds(1234, { decimals: 0 })).toBe("1s");
    expect(formatDurationSeconds(1234, { decimals: 1 })).toBe("1.2s");
    expect(formatDurationSeconds(1234, { decimals: 2 })).toBe("1.23s");
    expect(formatDurationSeconds(1234, { decimals: 3 })).toBe("1.234s");
  });

  it("trims trailing zeros", () => {
    expect(formatDurationSeconds(1000, { decimals: 2 })).toBe("1s");
    expect(formatDurationSeconds(1200, { decimals: 2 })).toBe("1.2s");
    expect(formatDurationSeconds(1230, { decimals: 2 })).toBe("1.23s");
  });

  it("uses seconds unit when specified", () => {
    expect(formatDurationSeconds(1500, { unit: "seconds" })).toBe("1.5 seconds");
    expect(formatDurationSeconds(1000, { unit: "seconds" })).toBe("1 seconds");
  });

  it("handles non-finite values", () => {
    expect(formatDurationSeconds(NaN)).toBe("unknown");
    expect(formatDurationSeconds(Infinity)).toBe("unknown");
    expect(formatDurationSeconds(-Infinity)).toBe("unknown");
  });

  it("handles large values", () => {
    expect(formatDurationSeconds(3600000)).toBe("3600s"); // 1 hour
    expect(formatDurationSeconds(86400000)).toBe("86400s"); // 1 day
  });
});

describe("formatDurationMs", () => {
  it("keeps milliseconds for values less than 1000ms", () => {
    expect(formatDurationMs(500)).toBe("500ms");
    expect(formatDurationMs(999)).toBe("999ms");
    expect(formatDurationMs(1)).toBe("1ms");
    expect(formatDurationMs(0)).toBe("0ms");
  });

  it("converts to seconds for values 1000ms or greater", () => {
    expect(formatDurationMs(1000)).toBe("1s");
    expect(formatDurationMs(1500)).toBe("1.5s");
    expect(formatDurationMs(5000)).toBe("5s");
  });

  it("uses 2 decimal places for seconds conversion by default", () => {
    expect(formatDurationMs(1234)).toBe("1.23s");
    expect(formatDurationMs(1500)).toBe("1.5s");
    expect(formatDurationMs(1666)).toBe("1.67s");
  });

  it("respects decimal places option for seconds conversion", () => {
    expect(formatDurationMs(1234, { decimals: 0 })).toBe("1s");
    expect(formatDurationMs(1234, { decimals: 1 })).toBe("1.2s");
    expect(formatDurationMs(1234, { decimals: 3 })).toBe("1.234s");
  });

  it("uses seconds unit when specified", () => {
    expect(formatDurationMs(1500, { unit: "seconds" })).toBe("1.5 seconds");
    expect(formatDurationMs(2000, { unit: "seconds" })).toBe("2 seconds");
  });

  it("handles non-finite values", () => {
    expect(formatDurationMs(NaN)).toBe("unknown");
    expect(formatDurationMs(Infinity)).toBe("unknown");
    expect(formatDurationMs(-Infinity)).toBe("unknown");
  });

  it("handles negative values", () => {
    expect(formatDurationMs(-500)).toBe("0ms");
    expect(formatDurationMs(-1500)).toBe("0s");
  });

  it("handles large values", () => {
    expect(formatDurationMs(3600000)).toBe("3600s"); // 1 hour
    expect(formatDurationMs(86400000)).toBe("86400s"); // 1 day
  });
});
