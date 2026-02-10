import { describe, expect, it } from "vitest";
import { parseBooleanValue } from "./boolean.js";

describe("parseBooleanValue", () => {
  describe("with boolean input", () => {
    it("returns true for boolean true", () => {
      expect(parseBooleanValue(true)).toBe(true);
    });

    it("returns false for boolean false", () => {
      expect(parseBooleanValue(false)).toBe(false);
    });
  });

  describe("with string input", () => {
    it("returns true for default truthy values", () => {
      expect(parseBooleanValue("true")).toBe(true);
      expect(parseBooleanValue("1")).toBe(true);
      expect(parseBooleanValue("yes")).toBe(true);
      expect(parseBooleanValue("on")).toBe(true);
    });

    it("returns false for default falsy values", () => {
      expect(parseBooleanValue("false")).toBe(false);
      expect(parseBooleanValue("0")).toBe(false);
      expect(parseBooleanValue("no")).toBe(false);
      expect(parseBooleanValue("off")).toBe(false);
    });

    it("handles case insensitive input", () => {
      expect(parseBooleanValue("TRUE")).toBe(true);
      expect(parseBooleanValue("True")).toBe(true);
      expect(parseBooleanValue("FALSE")).toBe(false);
      expect(parseBooleanValue("False")).toBe(false);
      expect(parseBooleanValue("YES")).toBe(true);
      expect(parseBooleanValue("NO")).toBe(false);
      expect(parseBooleanValue("ON")).toBe(true);
      expect(parseBooleanValue("OFF")).toBe(false);
    });

    it("trims whitespace", () => {
      expect(parseBooleanValue("  true  ")).toBe(true);
      expect(parseBooleanValue("\tfalse\n")).toBe(false);
      expect(parseBooleanValue("  yes  ")).toBe(true);
      expect(parseBooleanValue("  no  ")).toBe(false);
    });

    it("returns undefined for unrecognized values", () => {
      expect(parseBooleanValue("maybe")).toBeUndefined();
      expect(parseBooleanValue("unknown")).toBeUndefined();
      expect(parseBooleanValue("2")).toBeUndefined();
      expect(parseBooleanValue("-1")).toBeUndefined();
      expect(parseBooleanValue("enabled")).toBeUndefined();
      expect(parseBooleanValue("disabled")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(parseBooleanValue("")).toBeUndefined();
      expect(parseBooleanValue("   ")).toBeUndefined();
      expect(parseBooleanValue("\t\n")).toBeUndefined();
    });
  });

  describe("with custom options", () => {
    it("uses custom truthy values", () => {
      const options = { truthy: ["enabled", "active"] };
      expect(parseBooleanValue("enabled", options)).toBe(true);
      expect(parseBooleanValue("active", options)).toBe(true);
      expect(parseBooleanValue("true", options)).toBeUndefined();
    });

    it("uses custom falsy values", () => {
      const options = { falsy: ["disabled", "inactive"] };
      expect(parseBooleanValue("disabled", options)).toBe(false);
      expect(parseBooleanValue("inactive", options)).toBe(false);
      expect(parseBooleanValue("false", options)).toBeUndefined();
    });

    it("uses both custom truthy and falsy values", () => {
      const options = {
        truthy: ["enabled", "active", "yes"],
        falsy: ["disabled", "inactive", "no"],
      };
      expect(parseBooleanValue("enabled", options)).toBe(true);
      expect(parseBooleanValue("active", options)).toBe(true);
      expect(parseBooleanValue("yes", options)).toBe(true);
      expect(parseBooleanValue("disabled", options)).toBe(false);
      expect(parseBooleanValue("inactive", options)).toBe(false);
      expect(parseBooleanValue("no", options)).toBe(false);
      expect(parseBooleanValue("true", options)).toBeUndefined();
      expect(parseBooleanValue("false", options)).toBeUndefined();
    });

    it("handles empty custom arrays", () => {
      const options = { truthy: [], falsy: [] };
      expect(parseBooleanValue("true", options)).toBeUndefined();
      expect(parseBooleanValue("false", options)).toBeUndefined();
    });

    it("handles overlapping custom values", () => {
      const options = { truthy: ["yes"], falsy: ["yes"] };
      // Truthy should take precedence since it's checked first
      expect(parseBooleanValue("yes", options)).toBe(true);
    });
  });

  describe("with non-string, non-boolean input", () => {
    it("returns undefined for numbers", () => {
      expect(parseBooleanValue(1)).toBeUndefined();
      expect(parseBooleanValue(0)).toBeUndefined();
      expect(parseBooleanValue(42)).toBeUndefined();
    });

    it("returns undefined for null", () => {
      expect(parseBooleanValue(null)).toBeUndefined();
    });

    it("returns undefined for undefined", () => {
      expect(parseBooleanValue(undefined)).toBeUndefined();
    });

    it("returns undefined for objects", () => {
      expect(parseBooleanValue({})).toBeUndefined();
      expect(parseBooleanValue({ value: true })).toBeUndefined();
    });

    it("returns undefined for arrays", () => {
      expect(parseBooleanValue([])).toBeUndefined();
      expect(parseBooleanValue([true])).toBeUndefined();
    });

    it("returns undefined for functions", () => {
      expect(parseBooleanValue(() => true)).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles string objects", () => {
      const strObj = new String("true");
      expect(parseBooleanValue(strObj)).toBeUndefined();
    });

    it("handles boolean objects", () => {
      const boolObj = new Boolean(true);
      expect(parseBooleanValue(boolObj)).toBeUndefined();
    });

    it("preserves default options when not provided", () => {
      expect(parseBooleanValue("true")).toBe(true);
      expect(parseBooleanValue("false")).toBe(false);
    });

    it("handles empty options object", () => {
      expect(parseBooleanValue("true", {})).toBe(true);
      expect(parseBooleanValue("false", {})).toBe(false);
    });
  });
});
