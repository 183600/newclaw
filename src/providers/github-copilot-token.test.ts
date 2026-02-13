import fs from "node:fs/promises";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  resolveCopilotApiBaseUrlFromToken,
  resolveCopilotApiToken,
  DEFAULT_COPILOT_API_BASE_URL,
  type CachedCopilotToken,
} from "./github-copilot-token.js";

// Mock dependencies
vi.mock("../config/paths.js");
vi.mock("../infra/json-file.js");

import { resolveStateDir } from "../config/paths.js";
import { loadJsonFile, saveJsonFile } from "../infra/json-file.js";

const mockResolveStateDir = vi.mocked(resolveStateDir);
const mockLoadJsonFile = vi.mocked(loadJsonFile);
const mockSaveJsonFile = vi.mocked(saveJsonFile);

describe("github-copilot-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveStateDir.mockReturnValue("/mock/state/dir");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("deriveCopilotApiBaseUrlFromToken", () => {
    it("extracts base URL from token with proxy-ep", () => {
      const token = "otherdata;proxy-ep=https://proxy.githubcopilot.com;moredata";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBe("https://api.githubcopilot.com");
    });

    it("handles case insensitive proxy-ep", () => {
      const token = "data;PROXY-EP=https://proxy.example.com;other";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBe("https://api.example.com");
    });

    it("handles proxy-ep without protocol", () => {
      const token = "data;proxy-ep=proxy.test.com;other";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBe("https://api.test.com");
    });

    it("returns null for token without proxy-ep", () => {
      const token = "othertoken;othervalue=data";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBeNull();
    });

    it("returns null for empty token", () => {
      expect(deriveCopilotApiBaseUrlFromToken("")).toBeNull();
      expect(deriveCopilotApiBaseUrlFromToken("   ")).toBeNull();
      expect(deriveCopilotApiBaseUrlFromToken(null as any)).toBeNull();
    });

    it("handles token at start", () => {
      const token = "proxy-ep=https://proxy.test.com;other=data";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBe("https://api.test.com");
    });

    it("handles malformed proxy-ep gracefully", () => {
      const token = "data;proxy-ep=;other=data";
      const result = deriveCopilotApiBaseUrlFromToken(token);
      expect(result).toBeNull();
    });
  });

  describe("resolveCopilotApiToken", () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("returns cached token when valid", async () => {
      const cachedToken: CachedCopilotToken = {
        token: "cached-token;proxy-ep=https://proxy.test.com",
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
        updatedAt: Date.now() - 60 * 1000, // 1 minute ago
      };
      mockLoadJsonFile.mockReturnValue(cachedToken);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        fetchImpl: mockFetch,
      });

      expect(result).toEqual({
        token: cachedToken.token,
        expiresAt: cachedToken.expiresAt,
        source: "cache:/mock/state/dir/credentials/github-copilot.token.json",
        baseUrl: "https://api.test.com",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("fetches new token when cache is expired", async () => {
      const expiredToken: CachedCopilotToken = {
        token: "expired-token",
        expiresAt: Date.now() - 60 * 1000, // 1 minute ago
        updatedAt: Date.now() - 60 * 60 * 1000, // 1 hour ago
      };
      mockLoadJsonFile.mockReturnValue(expiredToken);

      const mockResponse = {
        token: "new-token;proxy-ep=https://proxy.new.com",
        expires_at: 1735689600,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        fetchImpl: mockFetch,
      });

      expect(mockFetch).toHaveBeenCalledWith("https://api.github.com/copilot_internal/v2/token", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer github-token",
        },
      });
      expect(result.token).toBe(mockResponse.token);
      expect(result.baseUrl).toBe("https://api.new.com");
      expect(mockSaveJsonFile).toHaveBeenCalled();
    });

    it("fetches new token when no cache exists", async () => {
      mockLoadJsonFile.mockReturnValue(undefined);

      const mockResponse = {
        token: "new-token",
        expires_at: 1735689600,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        fetchImpl: mockFetch,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.token).toBe(mockResponse.token);
      expect(result.baseUrl).toBe(DEFAULT_COPILOT_API_BASE_URL);
      expect(mockSaveJsonFile).toHaveBeenCalled();
    });

    it("throws error when fetch fails", async () => {
      mockLoadJsonFile.mockReturnValue(undefined);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as any);

      await expect(
        resolveCopilotApiToken({
          githubToken: "invalid-token",
          fetchImpl: mockFetch,
        }),
      ).rejects.toThrow("Copilot token exchange failed: HTTP 401");
    });

    it("handles malformed cached token", async () => {
      mockLoadJsonFile.mockReturnValue({ invalid: "structure" });

      const mockResponse = {
        token: "new-token",
        expires_at: 1735689600,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        fetchImpl: mockFetch,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.token).toBe(mockResponse.token);
    });

    it("uses default fetch when not provided", async () => {
      mockLoadJsonFile.mockReturnValue(undefined);

      // Mock global fetch
      const globalFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          token: "global-fetch-token",
          expires_at: 1735689600,
        }),
      });
      global.fetch = globalFetch;

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
      });

      expect(globalFetch).toHaveBeenCalled();
      expect(result.token).toBe("global-fetch-token");
    });

    it("passes custom environment", async () => {
      const customEnv = { CUSTOM_STATE_DIR: "/custom/path" };
      mockResolveStateDir.mockReturnValue("/custom/state/dir");

      const cachedToken: CachedCopilotToken = {
        token: "cached-token",
        expiresAt: Date.now() + 60 * 60 * 1000,
        updatedAt: Date.now(),
      };
      mockLoadJsonFile.mockReturnValue(cachedToken);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        env: customEnv,
      });

      expect(mockResolveStateDir).toHaveBeenCalledWith(customEnv);
      expect(result.source).toContain("/custom/state/dir");
    });

    it("uses safety margin for token expiry", async () => {
      const soonToExpireToken: CachedCopilotToken = {
        token: "soon-expire-token",
        expiresAt: Date.now() + 4 * 60 * 1000, // 4 minutes from now (within safety margin)
        updatedAt: Date.now(),
      };
      mockLoadJsonFile.mockReturnValue(soonToExpireToken);

      const mockResponse = {
        token: "fresh-token",
        expires_at: 1735689600,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await resolveCopilotApiToken({
        githubToken: "github-token",
        fetchImpl: mockFetch,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(result.token).toBe(mockResponse.token);
    });
  });
});
