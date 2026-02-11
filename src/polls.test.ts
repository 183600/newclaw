import { describe, expect, it } from "vitest";
import { normalizePollInput, normalizePollDurationHours, type PollInput } from "./polls.js";

describe("normalizePollInput", () => {
  it("should normalize a valid poll input", () => {
    const input: PollInput = {
      question: " What is your favorite color? ",
      options: [" Red ", " Blue ", " Green "],
      maxSelections: 2,
      durationHours: 24,
    };

    const result = normalizePollInput(input);

    expect(result.question).toBe("What is your favorite color?");
    expect(result.options).toEqual(["Red", "Blue", "Green"]);
    expect(result.maxSelections).toBe(2);
    expect(result.durationHours).toBe(24);
  });

  it("should use default values when optional fields are missing", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
    };

    const result = normalizePollInput(input);

    expect(result.question).toBe("Test question");
    expect(result.options).toEqual(["Option 1", "Option 2"]);
    expect(result.maxSelections).toBe(1);
    expect(result.durationHours).toBeUndefined();
  });

  it("should throw error for empty question", () => {
    const input: PollInput = {
      question: "   ",
      options: ["Option 1", "Option 2"],
    };

    expect(() => normalizePollInput(input)).toThrow("Poll question is required");
  });

  it("should throw error when less than 2 options", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Only one option"],
    };

    expect(() => normalizePollInput(input)).toThrow("Poll requires at least 2 options");
  });

  it("should filter out empty options", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "", "  ", "Option 2"],
    };

    const result = normalizePollInput(input);

    expect(result.options).toEqual(["Option 1", "Option 2"]);
  });

  it("should throw error when exceeding max options", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2", "Option 3"],
    };

    expect(() => normalizePollInput(input, { maxOptions: 2 })).toThrow(
      "Poll supports at most 2 options",
    );
  });

  it("should handle invalid maxSelections values", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
      maxSelections: NaN,
    };

    const result = normalizePollInput(input);
    expect(result.maxSelections).toBe(1); // Default value
  });

  it("should throw error when maxSelections is less than 1", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
      maxSelections: 0,
    };

    expect(() => normalizePollInput(input)).toThrow("maxSelections must be at least 1");
  });

  it("should throw error when maxSelections exceeds option count", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
      maxSelections: 3,
    };

    expect(() => normalizePollInput(input)).toThrow("maxSelections cannot exceed option count");
  });

  it("should handle invalid durationHours values", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
      durationHours: NaN,
    };

    const result = normalizePollInput(input);
    expect(result.durationHours).toBeUndefined();
  });

  it("should throw error when durationHours is less than 1", () => {
    const input: PollInput = {
      question: "Test question",
      options: ["Option 1", "Option 2"],
      durationHours: 0,
    };

    expect(() => normalizePollInput(input)).toThrow("durationHours must be at least 1");
  });
});

describe("normalizePollDurationHours", () => {
  it("should return the value when within valid range", () => {
    const result = normalizePollDurationHours(12, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(12);
  });

  it("should return default when value is undefined", () => {
    const result = normalizePollDurationHours(undefined, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(24);
  });

  it("should floor the value", () => {
    const result = normalizePollDurationHours(12.7, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(12);
  });

  it("should clamp to minimum of 1", () => {
    const result = normalizePollDurationHours(0.5, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(1);
  });

  it("should clamp to maximum", () => {
    const result = normalizePollDurationHours(100, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(72);
  });

  it("should handle infinity as maximum", () => {
    const result = normalizePollDurationHours(Number.POSITIVE_INFINITY, {
      defaultHours: 24,
      maxHours: 72,
    });
    expect(result).toBe(72);
  });

  it("should handle non-finite numbers with default", () => {
    const result = normalizePollDurationHours(NaN, { defaultHours: 24, maxHours: 72 });
    expect(result).toBe(24);
  });
});
