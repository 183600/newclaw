import { describe, expect, it } from "vitest";
import {
  resolveMemoryVectorState,
  resolveMemoryFtsState,
  resolveMemoryCacheSummary,
  resolveMemoryCacheState,
} from "./status-format.js";

describe("resolveMemoryVectorState", () => {
  it("should return muted and disabled when vector is not enabled", () => {
    const vector = { enabled: false };
    const result = resolveMemoryVectorState(vector);
    expect(result).toEqual({ tone: "muted", state: "disabled" });
  });

  it("should return ok and ready when vector is enabled and available", () => {
    const vector = { enabled: true, available: true };
    const result = resolveMemoryVectorState(vector);
    expect(result).toEqual({ tone: "ok", state: "ready" });
  });

  it("should return warn and unavailable when vector is enabled but not available", () => {
    const vector = { enabled: true, available: false };
    const result = resolveMemoryVectorState(vector);
    expect(result).toEqual({ tone: "warn", state: "unavailable" });
  });

  it("should return muted and unknown when vector is enabled but availability is undefined", () => {
    const vector = { enabled: true };
    const result = resolveMemoryVectorState(vector);
    expect(result).toEqual({ tone: "muted", state: "unknown" });
  });

  it("should return muted and unknown when vector is enabled and available is explicitly undefined", () => {
    const vector = { enabled: true, available: undefined };
    const result = resolveMemoryVectorState(vector);
    expect(result).toEqual({ tone: "muted", state: "unknown" });
  });
});

describe("resolveMemoryFtsState", () => {
  it("should return muted and disabled when fts is not enabled", () => {
    const fts = { enabled: false, available: true };
    const result = resolveMemoryFtsState(fts);
    expect(result).toEqual({ tone: "muted", state: "disabled" });
  });

  it("should return ok and ready when fts is enabled and available", () => {
    const fts = { enabled: true, available: true };
    const result = resolveMemoryFtsState(fts);
    expect(result).toEqual({ tone: "ok", state: "ready" });
  });

  it("should return warn and unavailable when fts is enabled but not available", () => {
    const fts = { enabled: true, available: false };
    const result = resolveMemoryFtsState(fts);
    expect(result).toEqual({ tone: "warn", state: "unavailable" });
  });
});

describe("resolveMemoryCacheSummary", () => {
  it("should return muted and cache off when cache is not enabled", () => {
    const cache = { enabled: false };
    const result = resolveMemoryCacheSummary(cache);
    expect(result).toEqual({ tone: "muted", text: "cache off" });
  });

  it("should return ok and cache on without entries when cache is enabled but no entries", () => {
    const cache = { enabled: true };
    const result = resolveMemoryCacheSummary(cache);
    expect(result).toEqual({ tone: "ok", text: "cache on" });
  });

  it("should return ok and cache on with entries when cache is enabled with entries", () => {
    const cache = { enabled: true, entries: 100 };
    const result = resolveMemoryCacheSummary(cache);
    expect(result).toEqual({ tone: "ok", text: "cache on (100)" });
  });

  it("should return ok and cache on with zero entries when cache is enabled with zero entries", () => {
    const cache = { enabled: true, entries: 0 };
    const result = resolveMemoryCacheSummary(cache);
    expect(result).toEqual({ tone: "ok", text: "cache on (0)" });
  });

  it("should return ok and cache on with negative entries when cache is enabled with negative entries", () => {
    const cache = { enabled: true, entries: -5 };
    const result = resolveMemoryCacheSummary(cache);
    expect(result).toEqual({ tone: "ok", text: "cache on (-5)" });
  });
});

describe("resolveMemoryCacheState", () => {
  it("should return muted and disabled when cache is not enabled", () => {
    const cache = { enabled: false };
    const result = resolveMemoryCacheState(cache);
    expect(result).toEqual({ tone: "muted", state: "disabled" });
  });

  it("should return ok and enabled when cache is enabled", () => {
    const cache = { enabled: true };
    const result = resolveMemoryCacheState(cache);
    expect(result).toEqual({ tone: "ok", state: "enabled" });
  });
});
