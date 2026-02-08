import { describe, expect, it } from "vitest";
import { extractLinksFromMessage } from "./detect.js";

describe("extractLinksFromMessage", () => {
  it("extracts bare http/https URLs in order", () => {
    const links = extractLinksFromMessage("see https://a.example and http://b.test");
    expect(links).toEqual(["https://a.example", "http://b.test"]);
  });

  it("dedupes links and enforces maxLinks", () => {
    const links = extractLinksFromMessage("https://a.example https://a.example https://b.test", {
      maxLinks: 1,
    });
    expect(links).toEqual(["https://a.example"]);
  });

  it("ignores markdown links", () => {
    const links = extractLinksFromMessage("[doc](https://docs.example) https://bare.example");
    expect(links).toEqual(["https://bare.example"]);
  });

  it("blocks 127.0.0.1", () => {
    const links = extractLinksFromMessage("http://127.0.0.1/test https://ok.test");
    expect(links).toEqual(["https://ok.test"]);
  });

  it("handles empty input", () => {
    expect(extractLinksFromMessage("")).toEqual([]);
    expect(extractLinksFromMessage("   ")).toEqual([]);
    expect(extractLinksFromMessage(null as any)).toEqual([]);
    expect(extractLinksFromMessage(undefined as any)).toEqual([]);
  });

  it("extracts URLs with punctuation", () => {
    const links = extractLinksFromMessage("Check https://example.com/path?query=value#fragment.");
    expect(links).toEqual(["https://example.com/path?query=value#fragment"]);
  });

  it("handles URLs with ports", () => {
    const links = extractLinksFromMessage(
      "Visit http://localhost:3000 and https://example.com:8080",
    );
    expect(links).toEqual(["http://localhost:3000", "https://example.com:8080"]);
  });

  it("handles URLs with authentication", () => {
    const links = extractLinksFromMessage("Use https://user:pass@example.com for access");
    expect(links).toEqual(["https://user:pass@example.com"]);
  });

  it("ignores non-http/https protocols", () => {
    const links = extractLinksFromMessage(
      "ftp://files.example.com file:///path/to/file https://good.example.com",
    );
    expect(links).toEqual(["https://good.example.com"]);
  });

  it("handles malformed URLs gracefully", () => {
    const links = extractLinksFromMessage("Check https:// and http://example.com");
    expect(links).toEqual(["http://example.com"]);
  });

  it("respects custom maxLinks setting", () => {
    const links = extractLinksFromMessage("https://a.example https://b.example https://c.example", {
      maxLinks: 2,
    });
    expect(links).toEqual(["https://a.example", "https://b.example"]);
  });

  it("handles invalid maxLinks values", () => {
    const links1 = extractLinksFromMessage("https://a.example https://b.example", { maxLinks: 0 });
    const links2 = extractLinksFromMessage("https://a.example https://b.example", { maxLinks: -1 });
    const links3 = extractLinksFromMessage("https://a.example https://b.example", {
      maxLinks: NaN,
    });
    const links4 = extractLinksFromMessage("https://a.example https://b.example", {
      maxLinks: Infinity,
    });

    // Should use default maxLinks for invalid values
    expect(links1.length).toBeGreaterThan(0);
    expect(links2.length).toBeGreaterThan(0);
    expect(links3.length).toBeGreaterThan(0);
    expect(links4.length).toBeGreaterThan(0);
  });

  it("handles multiple markdown links", () => {
    const links = extractLinksFromMessage(
      "[first](https://first.example) and [second](https://second.example)",
    );
    expect(links).toEqual([]);
  });

  it("handles mixed markdown and bare links", () => {
    const links = extractLinksFromMessage(
      "[doc](https://docs.example) and https://bare.example and [another](https://another.example)",
    );
    expect(links).toEqual(["https://bare.example"]);
  });

  it("handles URLs with trailing punctuation", () => {
    const links = extractLinksFromMessage(
      "Check this: https://example.com/path! Also https://test.com?",
    );
    expect(links).toEqual(["https://example.com/path", "https://test.com"]);
  });

  it("handles URLs in parentheses", () => {
    const links = extractLinksFromMessage("(See https://example.com for more info)");
    expect(links).toEqual(["https://example.com"]);
  });

  it("handles URLs with Unicode characters", () => {
    const links = extractLinksFromMessage("Visit https://例子.测试 and https://тест.example");
    expect(links).toEqual(["https://例子.测试", "https://тест.example"]);
  });

  it("handles URLs with fragments and query parameters", () => {
    const links = extractLinksFromMessage("https://example.com/path?param=value&other=123#section");
    expect(links).toEqual(["https://example.com/path?param=value&other=123#section"]);
  });

  it("blocks localhost with 127.0.0.1", () => {
    const links = extractLinksFromMessage("http://127.0.0.1:8080/test https://127.0.0.1/path");
    expect(links).toEqual([]);
  });

  it("allows localhost with other hostnames", () => {
    const links = extractLinksFromMessage("http://localhost.example https://local.127.0.0.1.com");
    expect(links).toEqual(["http://localhost.example", "https://local.127.0.0.1.com"]);
  });

  it("handles very long URLs", () => {
    const longPath = "/".repeat(1000);
    const links = extractLinksFromMessage(`https://example.com${longPath}`);
    expect(links).toEqual([`https://example.com${longPath}`]);
  });

  it("handles URLs at message boundaries", () => {
    const links1 = extractLinksFromMessage("https://example.com");
    const links2 = extractLinksFromMessage("https://example.com ");
    const links3 = extractLinksFromMessage(" https://example.com");

    expect(links1).toEqual(["https://example.com"]);
    expect(links2).toEqual(["https://example.com"]);
    expect(links3).toEqual(["https://example.com"]);
  });

  it("handles URLs with common TLDs", () => {
    const links = extractLinksFromMessage(
      "https://example.com https://test.org https://site.net https://page.io https://app.dev",
    );
    expect(links).toEqual([
      "https://example.com",
      "https://test.org",
      "https://site.net",
      "https://page.io",
      "https://app.dev",
    ]);
  });

  it("handles URLs with subdomains", () => {
    const links = extractLinksFromMessage(
      "https://api.example.com https://cdn.test.example.org https://sub.domain.co.uk",
    );
    expect(links).toEqual([
      "https://api.example.com",
      "https://cdn.test.example.org",
      "https://sub.domain.co.uk",
    ]);
  });
});
