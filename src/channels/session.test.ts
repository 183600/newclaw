import { describe, expect, it, vi, beforeEach } from "vitest";
import { recordInboundSession } from "./session.js";

// Mock the dependencies
vi.mock("../config/sessions.js", () => ({
  recordSessionMetaFromInbound: vi.fn(),
  updateLastRoute: vi.fn(),
}));

describe("recordInboundSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call recordSessionMetaFromInbound with provided parameters", async () => {
    const { recordSessionMetaFromInbound } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockGroupResolution = { groupId: "group456" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: mockGroupResolution,
      createIfMissing: true,
      onRecordError: mockOnRecordError,
    });

    expect(mockRecordSessionMetaFromInbound).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: mockGroupResolution,
      createIfMissing: true,
    });
  });

  it("should call updateLastRoute when updateLastRoute is provided", async () => {
    const { recordSessionMetaFromInbound, updateLastRoute } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    const mockUpdateLastRoute = vi.mocked(updateLastRoute);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);
    mockUpdateLastRoute.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockGroupResolution = { groupId: "group456" };
    const mockUpdate = {
      sessionKey: "session123",
      channel: "telegram" as const,
      to: "channel789",
      accountId: "account123",
      threadId: "thread456",
    };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: mockGroupResolution,
      updateLastRoute: mockUpdate,
      onRecordError: mockOnRecordError,
    });

    expect(mockUpdateLastRoute).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      deliveryContext: {
        channel: "telegram",
        to: "channel789",
        accountId: "account123",
        threadId: "thread456",
      },
      ctx: mockCtx,
      groupResolution: mockGroupResolution,
    });
  });

  it("should not call updateLastRoute when updateLastRoute is not provided", async () => {
    const { recordSessionMetaFromInbound, updateLastRoute } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    const mockUpdateLastRoute = vi.mocked(updateLastRoute);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      onRecordError: mockOnRecordError,
    });

    expect(mockUpdateLastRoute).not.toHaveBeenCalled();
  });

  it("should handle errors from recordSessionMetaFromInbound using onRecordError", async () => {
    const { recordSessionMetaFromInbound } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    const testError = new Error("Test error");
    mockRecordSessionMetaFromInbound.mockRejectedValue(testError);

    const mockCtx = { From: "user123" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      onRecordError: mockOnRecordError,
    });

    expect(mockOnRecordError).toHaveBeenCalledWith(testError);
  });

  it("should handle errors from updateLastRoute", async () => {
    const { recordSessionMetaFromInbound, updateLastRoute } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    const mockUpdateLastRoute = vi.mocked(updateLastRoute);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);
    const testError = new Error("Update error");
    mockUpdateLastRoute.mockRejectedValue(testError);

    const mockCtx = { From: "user123" };
    const mockUpdate = {
      sessionKey: "session123",
      channel: "telegram" as const,
      to: "channel789",
    };
    const mockOnRecordError = vi.fn();

    // The function should propagate the error from updateLastRoute
    await expect(
      recordInboundSession({
        storePath: "/test/store",
        sessionKey: "session123",
        ctx: mockCtx,
        updateLastRoute: mockUpdate,
        onRecordError: mockOnRecordError,
      }),
    ).rejects.toThrow("Update error");
  });

  it("should work with minimal parameters", async () => {
    const { recordSessionMetaFromInbound } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      onRecordError: mockOnRecordError,
    });

    expect(mockRecordSessionMetaFromInbound).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: undefined,
      createIfMissing: undefined,
    });
  });

  it("should handle optional groupResolution as null", async () => {
    const { recordSessionMetaFromInbound } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: null,
      onRecordError: mockOnRecordError,
    });

    expect(mockRecordSessionMetaFromInbound).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: null,
      createIfMissing: undefined,
    });
  });

  it("should handle optional createIfMissing as false", async () => {
    const { recordSessionMetaFromInbound } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      createIfMissing: false,
      onRecordError: mockOnRecordError,
    });

    expect(mockRecordSessionMetaFromInbound).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      groupResolution: undefined,
      createIfMissing: false,
    });
  });

  it("should handle updateLastRoute with optional accountId and threadId", async () => {
    const { recordSessionMetaFromInbound, updateLastRoute } = await import("../config/sessions.js");
    const mockRecordSessionMetaFromInbound = vi.mocked(recordSessionMetaFromInbound);
    const mockUpdateLastRoute = vi.mocked(updateLastRoute);
    mockRecordSessionMetaFromInbound.mockResolvedValue(undefined);
    mockUpdateLastRoute.mockResolvedValue(undefined);

    const mockCtx = { From: "user123" };
    const mockUpdate = {
      sessionKey: "session123",
      channel: "whatsapp" as const,
      to: "channel789",
      // accountId and threadId are optional
    };
    const mockOnRecordError = vi.fn();

    await recordInboundSession({
      storePath: "/test/store",
      sessionKey: "session123",
      ctx: mockCtx,
      updateLastRoute: mockUpdate,
      onRecordError: mockOnRecordError,
    });

    expect(mockUpdateLastRoute).toHaveBeenCalledWith({
      storePath: "/test/store",
      sessionKey: "session123",
      deliveryContext: {
        channel: "whatsapp",
        to: "channel789",
        accountId: undefined,
        threadId: undefined,
      },
      ctx: mockCtx,
      groupResolution: undefined,
    });
  });
});
