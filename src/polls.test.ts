import { describe, expect, it } from "vitest";
import { normalizePollInput, normalizePollDurationHours, type PollInput } from "./polls.js";

describe("normalizePollInput", () => {
  describe("question validation", () => {
    it("should throw error for empty question", () => {
      const input: PollInput = {
        question: "",
        options: ["Option 1", "Option 2"],
      };

      expect(() => normalizePollInput(input)).toThrow("Poll question is required");
    });

    it("should throw error for whitespace-only question", () => {
      const input: PollInput = {
        question: "   ",
        options: ["Option 1", "Option 2"],
      };

      expect(() => normalizePollInput(input)).toThrow("Poll question is required");
    });

    it("should trim question whitespace", () => {
      const input: PollInput = {
        question: "  What is your favorite color?  ",
        options: ["Red", "Blue"],
      };

      const result = normalizePollInput(input);
      expect(result.question).toBe("What is your favorite color?");
    });
  });

  describe("options validation", () => {
    it("should throw error for less than 2 options", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Only one option"],
      };

      expect(() => normalizePollInput(input)).toThrow("Poll requires at least 2 options");
    });

    it("should throw error for empty options array", () => {
      const input: PollInput = {
        question: "Test question",
        options: [],
      };

      expect(() => normalizePollInput(input)).toThrow("Poll requires at least 2 options");
    });

    it("should throw error when options exceed maxOptions", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["A", "B", "C", "D"],
      };

      expect(() => normalizePollInput(input, { maxOptions: 3 })).toThrow(
        "Poll supports at most 3 options",
      );
    });

    it("should filter out empty options", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "", "  ", "Option 2"],
      };

      const result = normalizePollInput(input);
      expect(result.options).toEqual(["Option 1", "Option 2"]);
    });

    it("should trim option whitespace", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["  Option 1  ", "  Option 2  "],
      };

      const result = normalizePollInput(input);
      expect(result.options).toEqual(["Option 1", "Option 2"]);
    });
  });

  describe("maxSelections validation", () => {
    it("should default to 1 when not specified", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
      };

      const result = normalizePollInput(input);
      expect(result.maxSelections).toBe(1);
    });

    it("should floor valid number values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: 2.7,
      };

      const result = normalizePollInput(input);
      expect(result.maxSelections).toBe(2);
    });

    it("should throw error for maxSelections less than 1", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: 0,
      };

      expect(() => normalizePollInput(input)).toThrow("maxSelections must be at least 1");
    });

    it("should throw error for negative maxSelections", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: -1,
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

    it("should handle infinite values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: Number.POSITIVE_INFINITY,
      };

      const result = normalizePollInput(input);
      expect(result.maxSelections).toBe(1); // Defaults to 1 for infinite values
    });

    it("should handle NaN values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: NaN,
      };

      const result = normalizePollInput(input);
      expect(result.maxSelections).toBe(1);
    });
  });

  describe("durationHours validation", () => {
    it("should default to undefined when not specified", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
      };

      const result = normalizePollInput(input);
      expect(result.durationHours).toBeUndefined();
    });

    it("should floor valid number values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: 2.7,
      };

      const result = normalizePollInput(input);
      expect(result.durationHours).toBe(2);
    });

    it("should throw error for durationHours less than 1", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: 0,
      };

      expect(() => normalizePollInput(input)).toThrow("durationHours must be at least 1");
    });

    it("should throw error for negative durationHours", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: -1,
      };

      expect(() => normalizePollInput(input)).toThrow("durationHours must be at least 1");
    });

    it("should handle infinite values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: Number.POSITIVE_INFINITY,
      };

      const result = normalizePollInput(input);
      expect(result.durationHours).toBeUndefined(); // Becomes undefined for infinite values
    });

    it("should handle NaN values", () => {
      const input: PollInput = {
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: NaN,
      };

      const result = normalizePollInput(input);
      expect(result.durationHours).toBeUndefined();
    });
  });

  describe("complete normalization", () => {
    it("should normalize a valid poll input", () => {
      const input: PollInput = {
        question: "  What is your favorite color?  ",
        options: ["  Red  ", "  Blue  ", "  Green  "],
        maxSelections: 2,
        durationHours: 24,
      };

      const result = normalizePollInput(input);

      expect(result).toEqual({
        question: "What is your favorite color?",
        options: ["Red", "Blue", "Green"],
        maxSelections: 2,
        durationHours: 24,
      });
    });

    it("should handle undefined options", () => {
      const input: PollInput = {
        question: "Test question",
        options: undefined as any,
      };

      expect(() => normalizePollInput(input)).toThrow("Poll requires at least 2 options");
    });
  });
});

describe("normalizePollDurationHours", () => {
  describe("value handling", () => {
    it("should return defaultHours for undefined value", () => {
      const result = normalizePollDurationHours(undefined, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(12);
    });

    it("should floor finite number values", () => {
      const result = normalizePollDurationHours(24.7, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(24);
    });

    it("should return maxHours for positive infinity", () => {
      const result = normalizePollDurationHours(Number.POSITIVE_INFINITY, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(168);
    });

    it("should return defaultHours for negative infinity", () => {
      const result = normalizePollDurationHours(Number.NEGATIVE_INFINITY, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(12);
    });

    it("should return defaultHours for NaN", () => {
      const result = normalizePollDurationHours(NaN, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(12);
    });
  });

  describe("boundary constraints", () => {
    it("should enforce minimum of 1 hour", () => {
      const result = normalizePollDurationHours(0, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(1);
    });

    it("should enforce minimum of 1 hour for negative values", () => {
      const result = normalizePollDurationHours(-5, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(1);
    });

    it("should enforce maximum hours limit", () => {
      const result = normalizePollDurationHours(200, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(168);
    });

    it("should handle values within bounds", () => {
      const result = normalizePollDurationHours(72, {
        defaultHours: 12,
        maxHours: 168,
      });

      expect(result).toBe(72);
    });

    it("should handle exact boundary values", () => {
      const result1 = normalizePollDurationHours(1, {
        defaultHours: 12,
        maxHours: 168,
      });
      expect(result1).toBe(1);

      const result2 = normalizePollDurationHours(168, {
        defaultHours: 12,
        maxHours: 168,
      });
      expect(result2).toBe(168);
    });
  });

  describe("different configurations", () => {
    it("should work with custom default and max hours", () => {
      const result = normalizePollDurationHours(5, {
        defaultHours: 6,
        maxHours: 24,
      });

      expect(result).toBe(5);
    });

    it("should clamp to custom bounds", () => {
      const result1 = normalizePollDurationHours(0, {
        defaultHours: 6,
        maxHours: 24,
      });
      expect(result1).toBe(1);

      const result2 = normalizePollDurationHours(30, {
        defaultHours: 6,
        maxHours: 24,
      });
      expect(result2).toBe(24);
    });
  });
});
