import { describe, expect, it, vi } from "vitest";
import { logInboundDrop, logTypingFailure, logAckFailure } from "./logging.js";

describe("logInboundDrop", () => {
  it("should log drop message with channel and reason", () => {
    const mockLog = vi.fn();
    logInboundDrop({
      log: mockLog,
      channel: "telegram",
      reason: "not authorized",
    });

    expect(mockLog).toHaveBeenCalledWith("telegram: drop not authorized");
  });

  it("should log drop message with channel, reason, and target", () => {
    const mockLog = vi.fn();
    logInboundDrop({
      log: mockLog,
      channel: "whatsapp",
      reason: "blocked sender",
      target: "+1234567890",
    });

    expect(mockLog).toHaveBeenCalledWith("whatsapp: drop blocked sender target=+1234567890");
  });

  it("should handle empty target", () => {
    const mockLog = vi.fn();
    logInboundDrop({
      log: mockLog,
      channel: "discord",
      reason: "rate limited",
      target: "",
    });

    expect(mockLog).toHaveBeenCalledWith("discord: drop rate limited");
  });

  it("should handle undefined target", () => {
    const mockLog = vi.fn();
    logInboundDrop({
      log: mockLog,
      channel: "slack",
      reason: "missing permissions",
    });

    expect(mockLog).toHaveBeenCalledWith("slack: drop missing permissions");
  });

  it("should handle special characters in reason and target", () => {
    const mockLog = vi.fn();
    logInboundDrop({
      log: mockLog,
      channel: "signal",
      reason: 'invalid format: "test"',
      target: "user@example.com",
    });

    expect(mockLog).toHaveBeenCalledWith(
      'signal: drop invalid format: "test" target=user@example.com',
    );
  });
});

describe("logTypingFailure", () => {
  it("should log typing failure with channel and error", () => {
    const mockLog = vi.fn();
    const error = new Error("Connection failed");
    logTypingFailure({
      log: mockLog,
      channel: "telegram",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("telegram typing failed: Error: Connection failed");
  });

  it("should log typing failure with channel, target, and error", () => {
    const mockLog = vi.fn();
    const error = new Error("Timeout");
    logTypingFailure({
      log: mockLog,
      channel: "whatsapp",
      target: "+1234567890",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith(
      "whatsapp typing failed target=+1234567890: Error: Timeout",
    );
  });

  it("should log typing failure with channel, action, target, and error", () => {
    const mockLog = vi.fn();
    const error = new Error("Rate limited");
    logTypingFailure({
      log: mockLog,
      channel: "discord",
      target: "user123",
      action: "start",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith(
      "discord typing action=start failed target=user123: Error: Rate limited",
    );
  });

  it("should log typing failure with stop action", () => {
    const mockLog = vi.fn();
    const error = new Error("Not found");
    logTypingFailure({
      log: mockLog,
      channel: "slack",
      target: "channel456",
      action: "stop",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith(
      "slack typing action=stop failed target=channel456: Error: Not found",
    );
  });

  it("should handle string error", () => {
    const mockLog = vi.fn();
    logTypingFailure({
      log: mockLog,
      channel: "signal",
      error: "Unknown error",
    });

    expect(mockLog).toHaveBeenCalledWith("signal typing failed: Unknown error");
  });

  it("should handle object error", () => {
    const mockLog = vi.fn();
    const error = { code: 500, message: "Internal error" };
    logTypingFailure({
      log: mockLog,
      channel: "imessage",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("imessage typing failed: [object Object]");
  });

  it("should handle null error", () => {
    const mockLog = vi.fn();
    logTypingFailure({
      log: mockLog,
      channel: "googlechat",
      error: null,
    });

    expect(mockLog).toHaveBeenCalledWith("googlechat typing failed: null");
  });

  it("should handle undefined error", () => {
    const mockLog = vi.fn();
    logTypingFailure({
      log: mockLog,
      channel: "web",
      error: undefined,
    });

    expect(mockLog).toHaveBeenCalledWith("web typing failed: undefined");
  });
});

describe("logAckFailure", () => {
  it("should log ack failure with channel and error", () => {
    const mockLog = vi.fn();
    const error = new Error("Message not found");
    logAckFailure({
      log: mockLog,
      channel: "telegram",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("telegram ack cleanup failed: Error: Message not found");
  });

  it("should log ack failure with channel, target, and error", () => {
    const mockLog = vi.fn();
    const error = new Error("Permission denied");
    logAckFailure({
      log: mockLog,
      channel: "whatsapp",
      target: "+1234567890",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith(
      "whatsapp ack cleanup failed target=+1234567890: Error: Permission denied",
    );
  });

  it("should handle string error", () => {
    const mockLog = vi.fn();
    logAckFailure({
      log: mockLog,
      channel: "discord",
      error: "Rate limit exceeded",
    });

    expect(mockLog).toHaveBeenCalledWith("discord ack cleanup failed: Rate limit exceeded");
  });

  it("should handle object error", () => {
    const mockLog = vi.fn();
    const error = { status: 404, detail: "Not found" };
    logAckFailure({
      log: mockLog,
      channel: "slack",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("slack ack cleanup failed: [object Object]");
  });

  it("should handle null error", () => {
    const mockLog = vi.fn();
    logAckFailure({
      log: mockLog,
      channel: "signal",
      error: null,
    });

    expect(mockLog).toHaveBeenCalledWith("signal ack cleanup failed: null");
  });

  it("should handle undefined error", () => {
    const mockLog = vi.fn();
    logAckFailure({
      log: mockLog,
      channel: "imessage",
      error: undefined,
    });

    expect(mockLog).toHaveBeenCalledWith("imessage ack cleanup failed: undefined");
  });

  it("should handle empty target", () => {
    const mockLog = vi.fn();
    const error = new Error("Timeout");
    logAckFailure({
      log: mockLog,
      channel: "googlechat",
      target: "",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("googlechat ack cleanup failed: Error: Timeout");
  });

  it("should handle undefined target", () => {
    const mockLog = vi.fn();
    const error = new Error("Timeout");
    logAckFailure({
      log: mockLog,
      channel: "web",
      error,
    });

    expect(mockLog).toHaveBeenCalledWith("web ack cleanup failed: Error: Timeout");
  });
});
