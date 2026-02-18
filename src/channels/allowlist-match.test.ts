import { describe, expect, it } from "vitest";
import { formatAllowlistMatchMeta } from "./allowlist-match.js";

describe("formatAllowlistMatchMeta", () => {
  it("should return none values when match is null", () => {
    const result = formatAllowlistMatchMeta(null);
    expect(result).toBe("matchKey=none matchSource=none");
  });

  it("should return none values when match is undefined", () => {
    const result = formatAllowlistMatchMeta(undefined);
    expect(result).toBe("matchKey=none matchSource=none");
  });

  it("should format match with matchKey and matchSource", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "user123",
      matchSource: "id",
    });
    expect(result).toBe("matchKey=user123 matchSource=id");
  });

  it("should format match with only matchKey", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "john.doe",
      matchSource: undefined,
    });
    expect(result).toBe("matchKey=john.doe matchSource=none");
  });

  it("should format match with only matchSource", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: undefined,
      matchSource: "name",
    });
    expect(result).toBe("matchKey=none matchSource=name");
  });

  it("should format match with empty matchKey", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "",
      matchSource: "username",
    });
    expect(result).toBe("matchKey= matchSource=username");
  });

  it("should format match with empty matchSource", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "tag123",
      matchSource: "",
    });
    expect(result).toBe("matchKey=tag123 matchSource=");
  });

  it("should handle special characters in matchKey", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "user@example.com",
      matchSource: "email",
    });
    expect(result).toBe("matchKey=user@example.com matchSource=email");
  });

  it("should handle spaces in matchKey", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "John Doe",
      matchSource: "name",
    });
    expect(result).toBe("matchKey=John Doe matchSource=name");
  });

  it("should handle numbers in matchKey and matchSource", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "12345",
      matchSource: "id-number",
    });
    expect(result).toBe("matchKey=12345 matchSource=id-number");
  });

  it("should handle boolean values in matchSource", () => {
    const result = formatAllowlistMatchMeta({
      matchKey: "test",
      matchSource: "wildcard" as unknown,
    });
    expect(result).toBe("matchKey=test matchSource=wildcard");
  });

  it("should handle empty object", () => {
    const result = formatAllowlistMatchMeta({});
    expect(result).toBe("matchKey=none matchSource=none");
  });
});
