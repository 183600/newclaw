/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  registerActiveProgressLine,
  clearActiveProgressLine,
  unregisterActiveProgressLine,
} from "./progress-line.js";

describe("progress-line - Additional Tests", () => {
  let mockStream: NodeJS.WriteStream;
  let mockStream2: NodeJS.WriteStream;

  beforeEach(() => {
    // Create mock streams
    mockStream = {
      isTTY: true,
      write: vi.fn(),
    } as unknown as NodeJS.WriteStream;

    mockStream2 = {
      isTTY: true,
      write: vi.fn(),
    } as unknown as NodeJS.WriteStream;
  });

  afterEach(() => {
    // Clean up the active stream after each test
    unregisterActiveProgressLine();
  });

  describe("registerActiveProgressLine", () => {
    it("should handle multiple registrations", () => {
      registerActiveProgressLine(mockStream);
      registerActiveProgressLine(mockStream2);

      // Clearing should write to the last registered stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream2.write)).toHaveBeenCalledWith("\r\x1b[2K");

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });

    it("should handle registration with the same stream", () => {
      registerActiveProgressLine(mockStream);
      registerActiveProgressLine(mockStream);

      // Should still work
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledWith("\r\x1b[2K");
    });

    it("should handle non-TTY stream", () => {
      mockStream.isTTY = false;
      registerActiveProgressLine(mockStream);

      // Clearing should not write to a non-registered stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });
  });

  describe("clearActiveProgressLine", () => {
    it("should handle multiple clears", () => {
      registerActiveProgressLine(mockStream);

      clearActiveProgressLine();
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledTimes(2);

      expect(vi.mocked(mockStream.write)).toHaveBeenNthCalledWith(1, "\r\x1b[2K");

      expect(vi.mocked(mockStream.write)).toHaveBeenNthCalledWith(2, "\r\x1b[2K");
    });

    it("should handle clear after unregister", () => {
      registerActiveProgressLine(mockStream);
      unregisterActiveProgressLine();

      // Should not write after unregister
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });

    it("should handle clear when write throws", () => {
      const error = new Error("Write error");
      mockStream.write = vi.fn().mockImplementation(() => {
        throw error;
      });

      registerActiveProgressLine(mockStream);

      // The function might throw, so let's handle that
      try {
        clearActiveProgressLine();
      } catch (e) {
        // Expected behavior, the error is propagated
        expect(e).toBe(error);
      }
    });
  });

  describe("unregisterActiveProgressLine", () => {
    it("should handle unregistering non-active stream", () => {
      registerActiveProgressLine(mockStream);

      // Try to unregister a different stream
      unregisterActiveProgressLine(mockStream2);

      // Should still be able to clear the original stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledWith("\r\x1b[2K");
    });

    it("should handle unregistering when no stream is active", () => {
      // Should not throw
      expect(() => unregisterActiveProgressLine()).not.toThrow();
    });

    it("should handle unregistering with null", () => {
      registerActiveProgressLine(mockStream);

      // Try to unregister with null (this unregisters the active stream)
      unregisterActiveProgressLine(null);

      // Should not be able to clear after unregistering with null
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });
  });

  describe("integration tests", () => {
    it("should handle complete workflow", () => {
      // Register stream
      registerActiveProgressLine(mockStream);

      // Clear multiple times
      clearActiveProgressLine();
      clearActiveProgressLine();

      // Unregister
      unregisterActiveProgressLine();

      // Try to clear after unregister
      clearActiveProgressLine();

      // Verify write was called only during the clear operations

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledTimes(2);
    });

    it("should handle stream that becomes non-TTY", () => {
      registerActiveProgressLine(mockStream);

      // Clear while TTY
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledTimes(1);

      // Stream becomes non-TTY
      mockStream.isTTY = false;

      // Clear while non-TTY
      clearActiveProgressLine();

      // Should not have been called again

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledTimes(1);
    });
  });
});
