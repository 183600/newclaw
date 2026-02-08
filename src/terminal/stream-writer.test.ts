import { describe, expect, it, vi, beforeEach } from "vitest";
import { createSafeStreamWriter, type SafeStreamWriterOptions } from "./stream-writer.ts";

describe("createSafeStreamWriter", () => {
  let mockStream: NodeJS.WriteStream;
  let mockOptions: SafeStreamWriterOptions;

  beforeEach(() => {
    mockStream = {
      write: vi.fn(),
    } as unknown as NodeJS.WriteStream;

    mockOptions = {
      beforeWrite: vi.fn(),
      onBrokenPipe: vi.fn(),
    };
  });

  it("writes text to stream successfully", () => {
    const writer = createSafeStreamWriter(mockOptions);
    const result = writer.write(mockStream, "test message");

    expect(result).toBe(true);
    expect(mockStream.write).toHaveBeenCalledWith("test message");
    expect(mockOptions.beforeWrite).toHaveBeenCalled();
  });

  it("writes text with newline using writeLine", () => {
    const writer = createSafeStreamWriter(mockOptions);
    const result = writer.writeLine(mockStream, "test message");

    expect(result).toBe(true);
    expect(mockStream.write).toHaveBeenCalledWith("test message\n");
    expect(mockOptions.beforeWrite).toHaveBeenCalled();
  });

  it("handles broken pipe errors", () => {
    const epipeError = new Error("Broken pipe") as NodeJS.ErrnoException;
    epipeError.code = "EPIPE";
    mockStream.write = vi.fn(() => {
      throw epipeError;
    });

    const writer = createSafeStreamWriter(mockOptions);
    const result = writer.write(mockStream, "test message");

    expect(result).toBe(false);
    expect(writer.isClosed()).toBe(true);
    expect(mockOptions.onBrokenPipe).toHaveBeenCalledWith(epipeError, mockStream);
  });

  it("handles EIO errors", () => {
    const eioError = new Error("Input/output error") as NodeJS.ErrnoException;
    eioError.code = "EIO";
    mockStream.write = vi.fn(() => {
      throw eioError;
    });

    const writer = createSafeStreamWriter(mockOptions);
    const result = writer.write(mockStream, "test message");

    expect(result).toBe(false);
    expect(writer.isClosed()).toBe(true);
    expect(mockOptions.onBrokenPipe).toHaveBeenCalledWith(eioError, mockStream);
  });

  it("re-throws non-broken pipe errors", () => {
    const otherError = new Error("Some other error");
    mockStream.write = vi.fn(() => {
      throw otherError;
    });

    const writer = createSafeStreamWriter(mockOptions);

    expect(() => writer.write(mockStream, "test message")).toThrow(otherError);
  });

  it("does not write after broken pipe", () => {
    const epipeError = new Error("Broken pipe") as NodeJS.ErrnoException;
    epipeError.code = "EPIPE";
    mockStream.write = vi.fn(() => {
      throw epipeError;
    });

    const writer = createSafeStreamWriter(mockOptions);
    writer.write(mockStream, "first message");

    // Reset mock to track subsequent calls
    mockStream.write = vi.fn();

    const result = writer.write(mockStream, "second message");

    expect(result).toBe(false);
    expect(mockStream.write).not.toHaveBeenCalled();
  });

  it("handles beforeWrite errors", () => {
    const beforeWriteError = new Error("Before write error");
    mockOptions.beforeWrite = vi.fn(() => {
      throw beforeWriteError;
    });

    const writer = createSafeStreamWriter(mockOptions);

    expect(() => writer.write(mockStream, "test message")).toThrow(beforeWriteError);
  });

  it("notifies broken pipe only once", () => {
    const epipeError = new Error("Broken pipe") as NodeJS.ErrnoException;
    epipeError.code = "EPIPE";
    mockStream.write = vi.fn(() => {
      throw epipeError;
    });

    const writer = createSafeStreamWriter(mockOptions);

    writer.write(mockStream, "first message");
    writer.write(mockStream, "second message");

    expect(mockOptions.onBrokenPipe).toHaveBeenCalledTimes(1);
  });

  it("resets closed state", () => {
    const epipeError = new Error("Broken pipe") as NodeJS.ErrnoException;
    epipeError.code = "EPIPE";
    mockStream.write = vi.fn(() => {
      throw epipeError;
    });

    const writer = createSafeStreamWriter(mockOptions);
    writer.write(mockStream, "test message");

    expect(writer.isClosed()).toBe(true);

    writer.reset();

    expect(writer.isClosed()).toBe(false);

    // Reset mock to allow successful writes
    mockStream.write = vi.fn();
    const result = writer.write(mockStream, "another message");

    expect(result).toBe(true);
  });

  it("works without options", () => {
    const writer = createSafeStreamWriter();
    const result = writer.write(mockStream, "test message");

    expect(result).toBe(true);
    expect(mockStream.write).toHaveBeenCalledWith("test message");
  });
});
