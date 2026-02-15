import { describe, expect, it } from "vitest";
import { fingerprintHeaderNames } from "./headers-fingerprint.js";

describe("fingerprintHeaderNames", () => {
  it("should return empty array for undefined headers", () => {
    expect(fingerprintHeaderNames(undefined)).toEqual([]);
  });

  it("should return empty array for null headers", () => {
    expect(fingerprintHeaderNames(null as any)).toEqual([]);
  });

  it("should normalize and sort header names", () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer token",
      "User-Agent": "test-agent",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["authorization", "content-type", "user-agent"]);
  });

  it("should handle headers with whitespace", () => {
    const headers = {
      "  Content-Type  ": "application/json",
      "Authorization\t": "Bearer token",
      "\nUser-Agent\n": "test-agent",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["authorization", "content-type", "user-agent"]);
  });

  it("should handle headers with mixed case", () => {
    const headers = {
      "CONTENT-TYPE": "application/json",
      aUTHORIZATION: "Bearer token",
      "uSER-aGENT": "test-agent",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["authorization", "content-type", "user-agent"]);
  });

  it("should handle empty header name", () => {
    const headers = {
      "": "empty",
      "   ": "whitespace",
      "Content-Type": "application/json",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["content-type"]);
  });

  it("should handle headers with special characters", () => {
    const headers = {
      "X-Custom-Header": "value",
      "X-Another-Header": "value",
      "Content-Type": "application/json",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["content-type", "x-another-header", "x-custom-header"]);
  });

  it("should handle empty headers object", () => {
    const headers = {};
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual([]);
  });

  it("should handle headers with numeric keys", () => {
    const headers = {
      "1": "numeric",
      "Content-Type": "application/json",
      "2": "another numeric",
    } as any;
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["1", "2", "content-type"]);
  });

  it("should handle headers with symbols", () => {
    const headers = {
      "X-Test_Header": "value",
      "X-Test-Header": "value",
      "X.Test.Header": "value",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["x-test_header", "x-test-header", "x.test.header"]);
  });

  it("should maintain consistent sorting", () => {
    const headers = {
      "Z-Header": "value",
      "A-Header": "value",
      "M-Header": "value",
    };
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["a-header", "m-header", "z-header"]);
  });

  it("should handle duplicate header names with different cases", () => {
    const headers = {
      "Content-Type": "application/json",
      "content-type": "text/html",
      "CONTENT-TYPE": "text/plain",
    };
    const result = fingerprintHeaderNames(headers);
    // Object.keys() will return all keys, even if they overwrite each other
    expect(result).toEqual(["content-type", "content-type", "content-type"]);
  });

  it("should handle headers with non-string values", () => {
    const headers = {
      "Content-Type": "application/json",
      "X-Number": 123,
      "X-Boolean": true,
      "X-Null": null,
      "X-Undefined": undefined,
    } as any;
    const result = fingerprintHeaderNames(headers);
    expect(result).toEqual(["content-type", "x-boolean", "x-null", "x-number", "x-undefined"]);
  });
});
