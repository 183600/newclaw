import { describe, expect, it } from "vitest";
import { parseBooleanValue } from "./boolean.js";

describe("parseBooleanValue - Additional Tests", () => {
  it("handles strings with zero-width non-joiners", () => {
    expect(parseBooleanValue("\u200Ctrue\u200C")).toBe(true);
    expect(parseBooleanValue("\u200Cfalse\u200C")).toBe(false);
  });

  it("handles strings with bidirectional text marks", () => {
    // Bidirectional text marks are not considered whitespace in the implementation
    expect(parseBooleanValue("\u202Atrue\u202B")).toBeUndefined();
    expect(parseBooleanValue("\u202Afalse\u202B")).toBeUndefined();
  });

  it("handles mixed Unicode whitespace", () => {
    expect(parseBooleanValue("\u2000\u2001true\u2002\u2003")).toBe(true);
    expect(parseBooleanValue("\u2004\u2005false\u2006\u2007")).toBe(false);
  });

  it("handles strings with object prototype pollution attempts", () => {
    expect(parseBooleanValue("__proto__")).toBeUndefined();
    expect(parseBooleanValue("constructor")).toBeUndefined();
    expect(parseBooleanValue("prototype")).toBeUndefined();
  });

  it("handles very long strings", () => {
    const longTruthy = "true" + "a".repeat(10000);
    const longFalsy = "false" + "b".repeat(10000);
    // The implementation trims whitespace but doesn't extract embedded truthy/falsy values
    expect(parseBooleanValue(longTruthy)).toBeUndefined();
    expect(parseBooleanValue(longFalsy)).toBeUndefined();
  });

  it("handles strings with null characters", () => {
    expect(parseBooleanValue("true\u0000")).toBeUndefined();
    expect(parseBooleanValue("\u0000true")).toBeUndefined();
    expect(parseBooleanValue("fal\u0000se")).toBeUndefined();
  });

  it("handles strings with line separators", () => {
    // Line separators (\u2028, \u2029) are actually matched by \s in the regex pattern
    // So they get trimmed and the remaining value is evaluated
    expect(parseBooleanValue("true\u2028")).toBe(true);
    expect(parseBooleanValue("false\u2029")).toBe(false);
    // Test with other whitespace characters
    expect(parseBooleanValue("true\u00A0")).toBe(true); // Non-breaking space
    expect(parseBooleanValue("false\u00A0")).toBe(false);
    // Test with characters that are NOT in the pattern
    expect(parseBooleanValue("true\u202A")).toBeUndefined(); // Left-to-right embed
    expect(parseBooleanValue("false\u202B")).toBeUndefined(); // Right-to-left embed
  });

  it("handles custom options with empty arrays", () => {
    const options = { truthy: [], falsy: [] };
    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("false", options)).toBeUndefined();
  });

  it("handles custom options with whitespace values", () => {
    const options = { truthy: [" true "], falsy: [" false "] };
    // With custom options, comparison is case-sensitive but still trims whitespace
    // So " true " gets trimmed to "true" which doesn't match " true "
    expect(parseBooleanValue(" true ", options)).toBeUndefined();
    expect(parseBooleanValue(" false ", options)).toBeUndefined();
    // We need to match the trimmed value
    expect(parseBooleanValue("true", options)).toBeUndefined();
    expect(parseBooleanValue("false", options)).toBeUndefined();
    // Let's test with custom options that match the trimmed values
    const trimmedOptions = { truthy: ["true"], falsy: ["false"] };
    expect(parseBooleanValue(" true ", trimmedOptions)).toBe(true);
    expect(parseBooleanValue(" false ", trimmedOptions)).toBe(false);
  });

  it("handles custom options with special characters", () => {
    const options = { truthy: ["yes!"], falsy: ["no#"] };
    expect(parseBooleanValue("yes!", options)).toBe(true);
    expect(parseBooleanValue("no#", options)).toBe(false);
  });

  it("handles custom options with numeric strings", () => {
    const options = { truthy: ["1"], falsy: ["0"] };
    expect(parseBooleanValue("1", options)).toBe(true);
    expect(parseBooleanValue("0", options)).toBe(false);
    expect(parseBooleanValue("2", options)).toBeUndefined();
  });

  it("handles strings with combining characters", () => {
    expect(parseBooleanValue("tr\u0301ue")).toBeUndefined(); // tŕue
    expect(parseBooleanValue("f\u0302alse")).toBeUndefined(); // f̂alse
  });

  it("handles emoji in strings", () => {
    expect(parseBooleanValue("👍true")).toBeUndefined();
    expect(parseBooleanValue("true👍")).toBeUndefined();
    expect(parseBooleanValue("👎false")).toBeUndefined();
    expect(parseBooleanValue("false👎")).toBeUndefined();
  });

  it("handles JSON-like values", () => {
    expect(parseBooleanValue('"true"')).toBeUndefined();
    expect(parseBooleanValue("'false'")).toBeUndefined();
    expect(parseBooleanValue("null")).toBeUndefined();
    expect(parseBooleanValue("undefined")).toBeUndefined();
  });

  it("handles numeric strings with default options", () => {
    expect(parseBooleanValue("1")).toBe(true);
    expect(parseBooleanValue("0")).toBe(false);
    expect(parseBooleanValue("-1")).toBeUndefined();
    expect(parseBooleanValue("2")).toBeUndefined();
    expect(parseBooleanValue("1.0")).toBeUndefined();
    expect(parseBooleanValue("0.0")).toBeUndefined();
  });

  it("handles hexadecimal strings", () => {
    expect(parseBooleanValue("0x1")).toBeUndefined();
    expect(parseBooleanValue("0x0")).toBeUndefined();
  });

  it("handles boolean-like words in different languages", () => {
    expect(parseBooleanValue("sí")).toBeUndefined(); // Spanish
    expect(parseBooleanValue("não")).toBeUndefined(); // Portuguese
    expect(parseBooleanValue("oui")).toBeUndefined(); // French
    expect(parseBooleanValue("nein")).toBeUndefined(); // German
  });
});
