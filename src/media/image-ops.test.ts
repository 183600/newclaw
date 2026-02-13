import fs from "node:fs/promises";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getImageMetadata,
  normalizeExifOrientation,
  resizeToJpeg,
  convertHeicToJpeg,
  hasAlphaChannel,
  resizeToPng,
  optimizeImageToPng,
} from "./image-ops.js";

// Mock dependencies
vi.mock("../process/exec.js");
vi.mock("sharp");

import sharp from "sharp";
import { runExec } from "../process/exec.js";

const mockRunExec = vi.mocked(runExec);
const mockSharp = vi.mocked(sharp);

describe("image-ops", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.OPENCLAW_IMAGE_BACKEND;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getImageMetadata", () => {
    it("returns metadata using sharp when available", async () => {
      const mockMetadata = { width: 800, height: 600 };
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await getImageMetadata(buffer);

      expect(result).toEqual({ width: 800, height: 600 });
      expect(mockSharp).toHaveBeenCalledWith(buffer, { failOnError: false });
    });

    it("returns null when sharp fails", async () => {
      const mockSharpInstance = {
        metadata: vi.fn().mockRejectedValue(new Error("Sharp error")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await getImageMetadata(buffer);

      expect(result).toBeNull();
    });

    it("returns null for invalid dimensions", async () => {
      const mockMetadata = { width: 0, height: 600 };
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue(mockMetadata),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await getImageMetadata(buffer);

      expect(result).toBeNull();
    });
  });

  describe("normalizeExifOrientation", () => {
    it("returns processed buffer when using sharp", async () => {
      // Force sharp backend
      process.env.OPENCLAW_IMAGE_BACKEND = "sharp";

      const processedBuffer = Buffer.from("processed-data");
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(processedBuffer),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await normalizeExifOrientation(buffer);

      expect(result).toBe(processedBuffer);
      expect(mockSharpInstance.rotate).toHaveBeenCalled();
    });

    it("returns original buffer when sharp is not available", async () => {
      // Force sharp backend
      process.env.OPENCLAW_IMAGE_BACKEND = "sharp";

      mockSharp.mockImplementation(() => {
        throw new Error("Sharp not available");
      });

      const buffer = Buffer.from("fake-image-data");
      const result = await normalizeExifOrientation(buffer);

      expect(result).toBe(buffer);
    });
  });

  describe("resizeToJpeg", () => {
    it("resizes image using sharp", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("resized")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await resizeToJpeg({
        buffer,
        maxSide: 400,
        quality: 80,
      });

      expect(result).toEqual(Buffer.from("resized"));
      expect(mockSharpInstance.rotate).toHaveBeenCalled();
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 400,
        height: 400,
        fit: "inside",
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80, mozjpeg: true });
    });

    it("handles withoutEnlargement option", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("resized")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      await resizeToJpeg({
        buffer,
        maxSide: 400,
        quality: 80,
        withoutEnlargement: false,
      });

      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 400,
        height: 400,
        fit: "inside",
        withoutEnlargement: false,
      });
    });
  });

  describe("convertHeicToJpeg", () => {
    it("converts HEIC to JPEG using sharp", async () => {
      const mockSharpInstance = {
        jpeg: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("jpeg")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-heic-data");
      const result = await convertHeicToJpeg(buffer);

      expect(result).toEqual(Buffer.from("jpeg"));
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 90, mozjpeg: true });
    });
  });

  describe("hasAlphaChannel", () => {
    it("returns true when image has alpha channel", async () => {
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({ hasAlpha: true }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await hasAlphaChannel(buffer);

      expect(result).toBe(true);
    });

    it("returns true when image has 4 channels", async () => {
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({ channels: 4 }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await hasAlphaChannel(buffer);

      expect(result).toBe(true);
    });

    it("returns false when image has no alpha", async () => {
      const mockSharpInstance = {
        metadata: vi.fn().mockResolvedValue({ hasAlpha: false, channels: 3 }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await hasAlphaChannel(buffer);

      expect(result).toBe(false);
    });

    it("returns false when sharp fails", async () => {
      mockSharp.mockImplementation(() => {
        throw new Error("Sharp error");
      });

      const buffer = Buffer.from("fake-image-data");
      const result = await hasAlphaChannel(buffer);

      expect(result).toBe(false);
    });
  });

  describe("resizeToPng", () => {
    it("resizes image to PNG with alpha preservation", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("png")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await resizeToPng({
        buffer,
        maxSide: 400,
        compressionLevel: 6,
      });

      expect(result).toEqual(Buffer.from("png"));
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 400,
        height: 400,
        fit: "inside",
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.png).toHaveBeenCalledWith({ compressionLevel: 6 });
    });

    it("uses default compression level when not specified", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("png")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      await resizeToPng({
        buffer,
        maxSide: 400,
      });

      expect(mockSharpInstance.png).toHaveBeenCalledWith({ compressionLevel: 6 });
    });
  });

  describe("optimizeImageToPng", () => {
    it("optimizes PNG within byte limit", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("optimized")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await optimizeImageToPng(buffer, 100000);

      expect(result).toEqual({
        buffer: Buffer.from("optimized"),
        optimizedSize: 9, // Buffer length of "optimized"
        resizeSide: 2048, // First size tried
        compressionLevel: 6, // First compression level tried
      });
    });

    it("tries different sizes and compression levels", async () => {
      let callCount = 0;
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockImplementation(() => {
          callCount++;
          // Return a buffer that's too large for first few attempts
          if (callCount < 5) {
            return Promise.resolve(Buffer.alloc(200000)); // 200KB
          }
          return Promise.resolve(Buffer.alloc(50000)); // 50KB - under limit
        }),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");
      const result = await optimizeImageToPng(buffer, 100000);

      expect(result.optimizedSize).toBe(50000);
      expect(result.resizeSide).toBeLessThan(2048); // Should have tried smaller sizes
    });

    it("throws error when optimization fails completely", async () => {
      const mockSharpInstance = {
        rotate: vi.fn().mockReturnThis(),
        resize: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockRejectedValue(new Error("Always fails")),
      };
      mockSharp.mockReturnValue(mockSharpInstance);

      const buffer = Buffer.from("fake-image-data");

      await expect(optimizeImageToPng(buffer, 100000)).rejects.toThrow(
        "Failed to optimize PNG image",
      );
    });
  });
});
