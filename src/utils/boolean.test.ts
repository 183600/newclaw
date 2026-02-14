import { describe, expect, it } from "vitest";
import { parseBooleanValue } from "./boolean.js";

describe("parseBooleanValue", () => {
  it("should return the original boolean value for boolean input", () => {
    expect(parseBooleanValue(true)).toBe(true);
    expect(parseBooleanValue(false)).toBe(false);
  });

  it("should return undefined for non-string, non-boolean input", () => {
    expect(parseBooleanValue(null)).toBeUndefined();
    expect(parseBooleanValue(undefined)).toBeUndefined();
    expect(parseBooleanValue(123)).toBeUndefined();
    expect(parseBooleanValue({})).toBeUndefined();
    expect(parseBooleanValue([])).toBeUndefined();
  });

  it("should return undefined for empty strings", () => {
    expect(parseBooleanValue("")).toBeUndefined();
    expect(parseBooleanValue("   ")).toBeUndefined();
    expect(parseBooleanValue("\t\n")).toBeUndefined();
    expect(parseBooleanValue("\u200B\u200C\u200D\uFEFF\u00A0")).toBeUndefined();
  });

  it("should parse default truthy values case-insensitively", () => {
    expect(parseBooleanValue("true")).toBe(true);
    expect(parseBooleanValue("TRUE")).toBe(true);
    expect(parseBooleanValue("True")).toBe(true);
    expect(parseBooleanValue("1")).toBe(true);
    expect(parseBooleanValue("yes")).toBe(true);
    expect(parseBooleanValue("YES")).toBe(true);
    expect(parseBooleanValue("on")).toBe(true);
    expect(parseBooleanValue("ON")).toBe(true);
  });

  it("should parse default falsy values case-insensitively", () => {
    expect(parseBooleanValue("false")).toBe(false);
    expect(parseBooleanValue("FALSE")).toBe(false);
    expect(parseBooleanValue("False")).toBe(false);
    expect(parseBooleanValue("0")).toBe(false);
    expect(parseBooleanValue("no")).toBe(false);
    expect(parseBooleanValue("NO")).toBe(false);
    expect(parseBooleanValue("off")).toBe(false);
    expect(parseBooleanValue("OFF")).toBe(false);
  });

  it("should return undefined for unrecognized values", () => {
    expect(parseBooleanValue("maybe")).toBeUndefined();
    expect(parseBooleanValue("2")).toBeUndefined();
    expect(parseBooleanValue("enabled")).toBeUndefined();
    expect(parseBooleanValue("disabled")).toBeUndefined();
  });

  it("should handle custom truthy values case-sensitively", () => {
    const options = { truthy: ["enabled", "active"] };
    expect(parseBooleanValue("enabled", options)).toBe(true);
    expect(parseBooleanValue("active", options)).toBe(true);
    expect(parseBooleanValue("ENABLED", options)).toBeUndefined();
    expect(parseBooleanValue("ACTIVE", options)).toBeUndefined();
  });

  it("should handle custom falsy values case-sensitively", () => {
    const options = { falsy: ["disabled", "inactive"] };
    expect(parseBooleanValue("disabled", options)).toBe(false);
    expect(parseBooleanValue("inactive", options)).toBe(false);
    expect(parseBooleanValue("DISABLED", options)).toBeUndefined();
    expect(parseBooleanValue("INACTIVE", options)).toBeUndefined();
  });

  it("should handle both custom truthy and falsy values", () => {
    const options = { truthy: ["enabled"], falsy: ["disabled"] };
    expect(parseBooleanValue("enabled", options)).toBe(true);
    expect(parseBooleanValue("disabled", options)).toBe(false);
    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("false", options)).toBeUndefined();
  });

  it("should handle strings with whitespace and special characters", () => {
    expect(parseBooleanValue("  true  ")).toBe(true);
    expect(parseBooleanValue("\tfalse\n")).toBe(false);
    expect(parseBooleanValue("  yes  ")).toBe(true);
    expect(parseBooleanValue("\nno\t")).toBe(false);
    expect(parseBooleanValue("\u200Btrue\u200C")).toBe(true);
  });

  it("should prioritize custom options over defaults", () => {
    // Custom truthy that overrides default falsy
    expect(parseBooleanValue("false", { truthy: ["false"] })).toBe(true);

    // Custom falsy that overrides default truthy
    expect(parseBooleanValue("true", { falsy: ["true"] })).toBe(false);
  });
});
