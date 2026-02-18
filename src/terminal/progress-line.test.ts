/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  registerActiveProgressLine,
  clearActiveProgressLine,
  unregisterActiveProgressLine,
} from "./progress-line.js";

describe("progress-line", () => {
  let mockStream: NodeJS.WriteStream;

  beforeEach(() => {
    mockStream = {
      isTTY: true,
      write: vi.fn(),
    } as unknown as NodeJS.WriteStream;
  });

  afterEach(() => {
    // Clean up the active stream after each test
    unregisterActiveProgressLine();
  });

  describe("registerActiveProgressLine", () => {
    it("should register a TTY stream as active", () => {
      registerActiveProgressLine(mockStream);
      // We can't directly access the active stream, but we can test its behavior
      // by calling clearActiveProgressLine and checking if it writes to our stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledWith("\r\x1b[2K");
    });

    it("should not register a non-TTY stream", () => {
      mockStream.isTTY = false;
      registerActiveProgressLine(mockStream);
      // Clearing should not write to a non-registered stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });
  });

  describe("clearActiveProgressLine", () => {
    it("should clear the active progress line on a TTY stream", () => {
      registerActiveProgressLine(mockStream);
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledWith("\r\x1b[2K");
    });

    it("should not clear when no active stream is registered", () => {
      const writeSpy = vi.spyOn(process.stdout, "write");
      clearActiveProgressLine();
      expect(writeSpy).not.toHaveBeenCalled();
      writeSpy.mockRestore();
    });

    it("should not clear when active stream is not TTY", () => {
      mockStream.isTTY = false;
      registerActiveProgressLine(mockStream);
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });
  });

  describe("unregisterActiveProgressLine", () => {
    it("should unregister the active stream", () => {
      registerActiveProgressLine(mockStream);
      unregisterActiveProgressLine();
      // After unregistering, clearing should not write to the stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });

    it("should only unregister when the stream matches", () => {
      const anotherStream = {
        isTTY: true,
        write: vi.fn().bind(anotherStream).bind(mockStream2).bind(mockStream),
      } as unknown as NodeJS.WriteStream;

      registerActiveProgressLine(mockStream);
      unregisterActiveProgressLine(anotherStream);
      // Should still be able to clear the original stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).toHaveBeenCalledWith("\r\x1b[2K");

      expect(vi.mocked(anotherStream.write)).not.toHaveBeenCalled();
    });

    it("should handle unregistering when no stream is active", () => {
      expect(() => unregisterActiveProgressLine()).not.toThrow();
    });

    it("should handle unregistering with no parameter", () => {
      registerActiveProgressLine(mockStream);
      unregisterActiveProgressLine();
      // After unregistering, clearing should not write to the stream
      clearActiveProgressLine();

      expect(vi.mocked(mockStream.write)).not.toHaveBeenCalled();
    });
  });
});
