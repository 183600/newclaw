import { describe, expect, it } from "vitest";
import { parseBooleanValue } from "./boolean.js";

describe("parseBooleanValue - Additional Tests", () => {
  it("should handle strings with Unicode whitespace", () => {
    expect(parseBooleanValue(" \u00A0true\u00A0 ")).toBe(true);
    expect(parseBooleanValue("\u200Bfalse\u200B")).toBe(false);
  });

  it("should handle strings with mixed case in custom options", () => {
    const options = { truthy: ["True"], falsy: ["False"] };

    // Custom options are case-sensitive
    expect(parseBooleanValue("True", options)).toBe(true);
    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("False", options)).toBe(false);
    expect(parseBooleanValue("false", options)).toBeUndefined();
  });

  it("should handle empty custom options", () => {
    const options = { truthy: [], falsy: [] };

    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("false", options)).toBeUndefined();
  });

  it("should handle custom options with special characters", () => {
    const options = {
      truthy: ["yes-please", "on!"],
      falsy: ["no-thanks", "off?"],
    };

    expect(parseBooleanValue("yes-please", options)).toBe(true);
    expect(parseBooleanValue("on!", options)).toBe(true);
    expect(parseBooleanValue("no-thanks", options)).toBe(false);
    expect(parseBooleanValue("off?", options)).toBe(false);
  });

  it("should handle numeric strings in custom options", () => {
    const options = {
      truthy: ["1", "2"],
      falsy: ["0", "-1"],
    };

    expect(parseBooleanValue("1", options)).toBe(true);
    expect(parseBooleanValue("2", options)).toBe(true);
    expect(parseBooleanValue("0", options)).toBe(false);
    expect(parseBooleanValue("-1", options)).toBe(false);
  });

  it("should handle strings with leading zeros", () => {
    expect(parseBooleanValue("0001")).toBeUndefined();
    expect(parseBooleanValue("0000")).toBeUndefined();
  });

  it("should handle strings with only whitespace characters", () => {
    expect(parseBooleanValue(" ")).toBeUndefined();
    expect(parseBooleanValue("\t")).toBeUndefined();
    expect(parseBooleanValue("\n")).toBeUndefined();
    expect(parseBooleanValue("\r")).toBeUndefined();
    expect(parseBooleanValue("\u00A0")).toBeUndefined();
    expect(parseBooleanValue("\u200B")).toBeUndefined();
  });

  it("should handle strings with repeated characters", () => {
    expect(parseBooleanValue("yyyy")).toBeUndefined();
    expect(parseBooleanValue("nnnn")).toBeUndefined();
    expect(parseBooleanValue("1111")).toBeUndefined();
    expect(parseBooleanValue("0000")).toBeUndefined();
  });

  it("should handle strings with emoji", () => {
    expect(parseBooleanValue("true👍")).toBeUndefined();
    expect(parseBooleanValue("false👎")).toBeUndefined();
    expect(parseBooleanValue("👍")).toBeUndefined();
    expect(parseBooleanValue("👎")).toBeUndefined();
  });

  it("should handle very long strings", () => {
    const longTrue = "t" + "r".repeat(1000) + "ue";
    const longFalse = "f" + "a".repeat(1000) + "lse";

    expect(parseBooleanValue(longTrue)).toBeUndefined();
    expect(parseBooleanValue(longFalse)).toBeUndefined();
  });

  it("should handle strings with URL encoding", () => {
    expect(parseBooleanValue("true%20")).toBeUndefined();
    expect(parseBooleanValue("false%0A")).toBeUndefined();
  });
});
