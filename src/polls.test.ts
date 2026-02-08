import { describe, expect, it } from "vitest";
import { normalizePollDurationHours, normalizePollInput } from "./polls.js";

describe("normalizePollInput", () => {
  describe("basic validation", () => {
    it("normalizes question/options and validates maxSelections", () => {
      expect(
        normalizePollInput({
          question: "  Lunch? ",
          options: [" Pizza ", " ", "Sushi"],
          maxSelections: 2,
        }),
      ).toEqual({
        question: "Lunch?",
        options: ["Pizza", "Sushi"],
        maxSelections: 2,
        durationHours: undefined,
      });
    });

    it("throws error for empty question", () => {
      expect(() =>
        normalizePollInput({
          question: "",
          options: ["Option 1", "Option 2"],
        }),
      ).toThrow("Poll question is required");

      expect(() =>
        normalizePollInput({
          question: "   ",
          options: ["Option 1", "Option 2"],
        }),
      ).toThrow("Poll question is required");
    });

    it("throws error for insufficient options", () => {
      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: [],
        }),
      ).toThrow("Poll requires at least 2 options");

      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Only one option"],
        }),
      ).toThrow("Poll requires at least 2 options");

      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["", "   ", ""],
        }),
      ).toThrow("Poll requires at least 2 options");
    });

    it("throws error for maxSelections less than 1", () => {
      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          maxSelections: 0,
        }),
      ).toThrow("maxSelections must be at least 1");

      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          maxSelections: -1,
        }),
      ).toThrow("maxSelections must be at least 1");
    });

    it("throws error when maxSelections exceeds option count", () => {
      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          maxSelections: 3,
        }),
      ).toThrow("maxSelections cannot exceed option count");
    });

    it("throws error for durationHours less than 1", () => {
      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          durationHours: 0,
        }),
      ).toThrow("durationHours must be at least 1");

      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          durationHours: -5,
        }),
      ).toThrow("durationHours must be at least 1");
    });
  });

  describe("max options validation", () => {
    it("enforces max option count when configured", () => {
      expect(() =>
        normalizePollInput({ question: "Q", options: ["A", "B", "C"] }, { maxOptions: 2 }),
      ).toThrow(/at most 2/);
    });

    it("allows exact max options", () => {
      const result = normalizePollInput({ question: "Q", options: ["A", "B"] }, { maxOptions: 2 });
      expect(result.options).toEqual(["A", "B"]);
    });

    it("works without max options limit", () => {
      const options = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`);
      const result = normalizePollInput({
        question: "Many options question",
        options,
      });
      expect(result.options).toEqual(options);
    });
  });

  describe("default values", () => {
    it("uses default maxSelections of 1", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "Option 2"],
      });
      expect(result.maxSelections).toBe(1);
    });

    it("handles undefined maxSelections", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: undefined,
      });
      expect(result.maxSelections).toBe(1);
    });

    it("handles undefined durationHours", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "Option 2"],
        durationHours: undefined,
      });
      expect(result.durationHours).toBeUndefined();
    });
  });

  describe("numeric validation and normalization", () => {
    it("floors maxSelections and durationHours", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "Option 2", "Option 3"],
        maxSelections: 2.7,
        durationHours: 24.9,
      });
      expect(result.maxSelections).toBe(2);
      expect(result.durationHours).toBe(24);
    });

    it("handles non-finite numbers", () => {
      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          maxSelections: NaN,
        }),
      ).not.toThrow();

      expect(() =>
        normalizePollInput({
          question: "Test question",
          options: ["Option 1", "Option 2"],
          maxSelections: Infinity,
        }),
      ).not.toThrow();

      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "Option 2"],
        maxSelections: NaN,
      });
      expect(result.maxSelections).toBe(1);
    });
  });

  describe("option processing", () => {
    it("filters out empty and whitespace-only options", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Option 1", "", "  ", "Option 2", "\t", "Option 3"],
      });
      expect(result.options).toEqual(["Option 1", "Option 2", "Option 3"]);
    });

    it("trims whitespace from options", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["  Option 1  ", "\tOption 2\t", "\nOption 3\n"],
      });
      expect(result.options).toEqual(["Option 1", "Option 2", "Option 3"]);
    });

    it("preserves option order", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Z", "A", "M", "B"],
      });
      expect(result.options).toEqual(["Z", "A", "M", "B"]);
    });

    it("handles duplicate options", () => {
      const result = normalizePollInput({
        question: "Test question",
        options: ["Same", "Different", "Same"],
      });
      expect(result.options).toEqual(["Same", "Different", "Same"]);
    });
  });

  describe("complex scenarios", () => {
    it("handles complete valid input", () => {
      const result = normalizePollInput({
        question: "  What's your favorite color?  ",
        options: ["  Red  ", "Blue", "  Green ", "Yellow"],
        maxSelections: 2,
        durationHours: 48,
      });
      expect(result).toEqual({
        question: "What's your favorite color?",
        options: ["Red", "Blue", "Green", "Yellow"],
        maxSelections: 2,
        durationHours: 48,
      });
    });

    it("handles single selection poll", () => {
      const result = normalizePollInput({
        question: "Choose one",
        options: ["Yes", "No"],
        maxSelections: 1,
      });
      expect(result.maxSelections).toBe(1);
    });

    it("handles multi-selection poll", () => {
      const result = normalizePollInput({
        question: "Choose all that apply",
        options: ["A", "B", "C", "D"],
        maxSelections: 3,
      });
      expect(result.maxSelections).toBe(3);
    });

    it("handles poll with time limit", () => {
      const result = normalizePollInput({
        question: "Quick poll",
        options: ["Option 1", "Option 2"],
        durationHours: 1,
      });
      expect(result.durationHours).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("handles minimal valid input", () => {
      const result = normalizePollInput({
        question: "Q",
        options: ["A", "B"],
      });
      expect(result).toEqual({
        question: "Q",
        options: ["A", "B"],
        maxSelections: 1,
        durationHours: undefined,
      });
    });

    it("handles very long question and options", () => {
      const longQuestion = "Q".repeat(1000);
      const longOptions = Array.from({ length: 2 }, (_, i) => "O".repeat(500));

      const result = normalizePollInput({
        question: longQuestion,
        options: longOptions,
      });

      expect(result.question).toBe(longQuestion);
      expect(result.options).toEqual(longOptions);
    });

    it("handles options with special characters", () => {
      const result = normalizePollInput({
        question: "Special chars test",
        options: ["🎉 Option", "Option with & symbols", "Option <with> brackets"],
      });
      expect(result.options).toEqual([
        "🎉 Option",
        "Option with & symbols",
        "Option <with> brackets",
      ]);
    });
  });
});

describe("normalizePollDurationHours", () => {
  it("clamps poll duration with defaults", () => {
    expect(normalizePollDurationHours(undefined, { defaultHours: 24, maxHours: 48 })).toBe(24);
    expect(normalizePollDurationHours(999, { defaultHours: 24, maxHours: 48 })).toBe(48);
    expect(normalizePollDurationHours(1, { defaultHours: 24, maxHours: 48 })).toBe(1);
  });

  it("handles edge cases", () => {
    expect(normalizePollDurationHours(0, { defaultHours: 24, maxHours: 48 })).toBe(1);
    expect(normalizePollDurationHours(-5, { defaultHours: 24, maxHours: 48 })).toBe(1);
    expect(normalizePollDurationHours(NaN, { defaultHours: 24, maxHours: 48 })).toBe(24);
    expect(normalizePollDurationHours(Infinity, { defaultHours: 24, maxHours: 48 })).toBe(48);
  });

  it("floors decimal values", () => {
    expect(normalizePollDurationHours(24.7, { defaultHours: 24, maxHours: 48 })).toBe(24);
    expect(normalizePollDurationHours(47.9, { defaultHours: 24, maxHours: 48 })).toBe(47);
  });

  it("handles different default and max values", () => {
    expect(normalizePollDurationHours(undefined, { defaultHours: 12, maxHours: 72 })).toBe(12);
    expect(normalizePollDurationHours(100, { defaultHours: 12, maxHours: 72 })).toBe(72);
    expect(normalizePollDurationHours(5, { defaultHours: 12, maxHours: 72 })).toBe(5);
  });

  it("handles minimum boundary", () => {
    expect(normalizePollDurationHours(1, { defaultHours: 24, maxHours: 48 })).toBe(1);
    expect(normalizePollDurationHours(0.9, { defaultHours: 24, maxHours: 48 })).toBe(1);
  });

  it("handles maximum boundary", () => {
    expect(normalizePollDurationHours(48, { defaultHours: 24, maxHours: 48 })).toBe(48);
    expect(normalizePollDurationHours(48.1, { defaultHours: 24, maxHours: 48 })).toBe(48);
  });
});
