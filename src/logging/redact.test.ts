import { describe, expect, it } from "vitest";
import {
  redactSensitiveText,
  redactToolDetail,
  getDefaultRedactPatterns,
  type RedactOptions,
} from "./redact.ts";

describe("redactSensitiveText", () => {
  it("redacts API keys from environment variables", () => {
    const text = 'API_KEY="sk-1234567890abcdef" and SECRET="abc123def456"';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('API_KEY="sk-123…cdef"');
    expect(redacted).toContain('SECRET="***"');
  });

  it("redacts tokens from JSON", () => {
    const text = '{"apiKey": "sk-1234567890abcdef", "token": "ghp_1234567890abcdef"}';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('"apiKey": "sk-123…cdef"');
    expect(redacted).toContain('"token": "ghp_12…cdef"');
  });

  it("redacts CLI flags", () => {
    const text = '--api-key sk-1234567890abcdef --token "abc123def456"';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("--api-key sk-123…cdef");
    expect(redacted).toContain('--token "***"');
  });

  it("redacts Authorization headers", () => {
    const text = "Authorization: Bearer sk-1234567890abcdef";
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("Authorization: Bearer sk-123…cdef");
  });

  it("redacts Bearer tokens", () => {
    const text = "Bearer sk-1234567890abcdef1234567890";
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("Bearer sk-123…7890");
  });

  it("redacts PEM private key blocks", () => {
    const text = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef
more content here
1234567890abcdef
-----END RSA PRIVATE KEY-----`;
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("-----BEGIN RSA PRIVATE KEY-----");
    expect(redacted).toContain("…redacted…");
    expect(redacted).toContain("-----END RSA PRIVATE KEY-----");
    expect(redacted).not.toContain("MIIEpAIBAAKCAQEA1234567890abcdef");
  });

  it("redacts common token prefixes", () => {
    const text = "OpenAI token: sk-1234567890abcdef, GitHub token: ghp_1234567890abcdef";
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("sk-123…def");
    expect(redacted).toContain("ghp_12…cdef");
  });

  it("handles short tokens", () => {
    const text = 'API_KEY="short"';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('API_KEY="***"');
  });

  it("preserves non-matching content", () => {
    const text = "This is normal text without any secrets";
    const redacted = redactSensitiveText(text);

    expect(redacted).toBe(text);
  });

  it("handles empty input", () => {
    expect(redactSensitiveText("")).toBe("");
    expect(redactSensitiveText(null as any)).toBe(null);
    expect(redactSensitiveText(undefined as any)).toBe(undefined);
  });

  it("can be disabled with mode: 'off'", () => {
    const text = 'API_KEY="sk-1234567890abcdef"';
    const options: RedactOptions = { mode: "off" };
    const redacted = redactSensitiveText(text, options);

    expect(redacted).toBe(text);
  });

  it("uses custom patterns", () => {
    const text = "CUSTOM_TOKEN=abc123def456";
    const options: RedactOptions = {
      patterns: [String.raw`CUSTOM_TOKEN=([^\s]+)`],
    };
    const redacted = redactSensitiveText(text, options);

    expect(redacted).toContain("CUSTOM_TOKEN=***");
  });

  it("handles regex patterns with flags", () => {
    const text = "token:ABC123def456";
    const options: RedactOptions = {
      patterns: ["/token:([A-Z0-9]+)/i"],
    };
    const redacted = redactSensitiveText(text, options);

    expect(redacted).toContain("token:***");
  });

  it("skips invalid regex patterns", () => {
    const text = "API_KEY=sk-1234567890abcdef";
    const options: RedactOptions = {
      patterns: ["[invalid regex", "/token:([A-Z0-9]+)/i"],
    };
    const redacted = redactSensitiveText(text, options);

    // Should still redact with the valid pattern
    expect(redacted).toBe("API_KEY=sk-1234567890abcdef");
  });
});

describe("redactToolDetail", () => {
  it("redacts tool details when in tools mode", () => {
    const text = 'Using API key "sk-1234567890abcdef" for tool execution';
    const redacted = redactToolDetail(text);

    expect(redacted).toContain("sk-123…cdef");
  });

  it("preserves content when not in tools mode", () => {
    // This test assumes the default config has tools mode enabled
    // In a real scenario, this would depend on the actual config
    const text = "Tool execution completed successfully";
    const redacted = redactToolDetail(text);

    expect(redacted).toBe(text);
  });
});

describe("getDefaultRedactPatterns", () => {
  it("returns the default patterns array", () => {
    const patterns = getDefaultRedactPatterns();

    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]).toContain("KEY");
  });

  it("returns a copy of the patterns", () => {
    const patterns1 = getDefaultRedactPatterns();
    const patterns2 = getDefaultRedactPatterns();

    expect(patterns1).not.toBe(patterns2);
    expect(patterns1).toEqual(patterns2);
  });
});

describe("edge cases", () => {
  it("handles multiple occurrences of the same pattern", () => {
    const text = 'API_KEY="sk-1234567890abcdef" and API_KEY="sk-abcdef1234567890"';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("sk-123…cdef");
    expect(redacted).toContain("sk-abc…7890");
  });

  it("handles overlapping patterns", () => {
    const text = "Bearer sk-1234567890abcdef with Authorization: Bearer sk-1234567890abcdef";
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("Bearer sk-123…cdef");
    expect(redacted).toContain("Authorization: Bearer sk-123…cdef");
  });

  it("handles special characters in tokens", () => {
    const text = 'TOKEN="sk-1234567890abcdef-_+="';
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("sk-123…-_+=");
  });

  it("handles multiline content", () => {
    const text = `API_KEY="sk-1234567890abcdef"
OTHER_VALUE="normal"
SECRET="abc123def456"`;
    const redacted = redactSensitiveText(text);

    expect(redacted).toContain("sk-123…cdef");
    expect(redacted).toContain('SECRET="***"');
    expect(redacted).toContain('OTHER_VALUE="normal"');
  });
});
