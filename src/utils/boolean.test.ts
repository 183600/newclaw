import { describe, expect, it } from "vitest";
import { parseBooleanValue } from "./boolean.js";

describe("parseBooleanValue", () => {
  it("returns boolean values unchanged", () => {
    expect(parseBooleanValue(true)).toBe(true);
    expect(parseBooleanValue(false)).toBe(false);
  });

  it("returns undefined for non-string, non-boolean values", () => {
    expect(parseBooleanValue(null)).toBeUndefined();
    expect(parseBooleanValue(undefined)).toBeUndefined();
    expect(parseBooleanValue(123)).toBeUndefined();
    expect(parseBooleanValue({})).toBeUndefined();
    expect(parseBooleanValue([])).toBeUndefined();
  });

  it("returns undefined for empty strings", () => {
    expect(parseBooleanValue("")).toBeUndefined();
    expect(parseBooleanValue("   ")).toBeUndefined();
    expect(parseBooleanValue("\t\n")).toBeUndefined();
  });

  it("parses default truthy values case-insensitively", () => {
    expect(parseBooleanValue("true")).toBe(true);
    expect(parseBooleanValue("TRUE")).toBe(true);
    expect(parseBooleanValue("True")).toBe(true);
    expect(parseBooleanValue("1")).toBe(true);
    expect(parseBooleanValue("yes")).toBe(true);
    expect(parseBooleanValue("YES")).toBe(true);
    expect(parseBooleanValue("on")).toBe(true);
    expect(parseBooleanValue("ON")).toBe(true);
  });

  it("parses default falsy values case-insensitively", () => {
    expect(parseBooleanValue("false")).toBe(false);
    expect(parseBooleanValue("FALSE")).toBe(false);
    expect(parseBooleanValue("False")).toBe(false);
    expect(parseBooleanValue("0")).toBe(false);
    expect(parseBooleanValue("no")).toBe(false);
    expect(parseBooleanValue("NO")).toBe(false);
    expect(parseBooleanValue("off")).toBe(false);
    expect(parseBooleanValue("OFF")).toBe(false);
  });

  it("handles strings with whitespace", () => {
    expect(parseBooleanValue("  true  ")).toBe(true);
    expect(parseBooleanValue("\tfalse\n")).toBe(false);
    expect(parseBooleanValue(" yes ")).toBe(true);
  });

  it("handles Unicode whitespace characters", () => {
    expect(parseBooleanValue("\u00A0true\u00A0")).toBe(true); // Non-breaking space
    expect(parseBooleanValue("\u200Bfalse\u200B")).toBe(false); // Zero-width space
    expect(parseBooleanValue("\u200Cyes\u200C")).toBe(true); // Zero-width non-joiner
    expect(parseBooleanValue("\u200Dno\u200D")).toBe(false); // Zero-width joiner
    expect(parseBooleanValue("\uFEFFon\uFEFF")).toBe(true); // Zero-width no-break space
  });

  it("returns undefined for unrecognized values", () => {
    expect(parseBooleanValue("maybe")).toBeUndefined();
    expect(parseBooleanValue("2")).toBeUndefined();
    expect(parseBooleanValue("enabled")).toBeUndefined();
    expect(parseBooleanValue("disabled")).toBeUndefined();
  });

  it("uses custom truthy options case-sensitively", () => {
    const options = { truthy: ["enabled", "active", "1"] };
    expect(parseBooleanValue("enabled", options)).toBe(true);
    expect(parseBooleanValue("active", options)).toBe(true);
    expect(parseBooleanValue("1", options)).toBe(true);
    expect(parseBooleanValue("ENABLED", options)).toBeUndefined();
    expect(parseBooleanValue("Active", options)).toBeUndefined();
  });

  it("uses custom falsy options case-sensitively", () => {
    const options = { falsy: ["disabled", "inactive", "0"] };
    expect(parseBooleanValue("disabled", options)).toBe(false);
    expect(parseBooleanValue("inactive", options)).toBe(false);
    expect(parseBooleanValue("0", options)).toBe(false);
    expect(parseBooleanValue("DISABLED", options)).toBeUndefined();
    expect(parseBooleanValue("Inactive", options)).toBeUndefined();
  });

  it("uses both custom truthy and falsy options", () => {
    const options = { truthy: ["yes", "sure"], falsy: ["no", "nope"] };
    expect(parseBooleanValue("yes", options)).toBe(true);
    expect(parseBooleanValue("sure", options)).toBe(true);
    expect(parseBooleanValue("no", options)).toBe(false);
    expect(parseBooleanValue("nope", options)).toBe(false);
    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("false", options)).toBeUndefined();
  });

  it("handles mixed custom options with default values", () => {
    const truthyOptions = { truthy: ["custom"] };
    const falsyOptions = { falsy: ["custom"] };

    // With custom truthy only
    expect(parseBooleanValue("custom", truthyOptions)).toBe(true);
    expect(parseBooleanValue("true", truthyOptions)).toBeUndefined();

    // With custom falsy only
    expect(parseBooleanValue("custom", falsyOptions)).toBe(false);
    expect(parseBooleanValue("false", falsyOptions)).toBeUndefined();
  });
});
