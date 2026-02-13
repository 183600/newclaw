import { describe, expect, it } from "vitest";
import {
  LEGACY_CANVAS_HANDLER_NAMES,
  LEGACY_MACOS_APP_SOURCES_DIRS,
  LEGACY_MANIFEST_KEYS,
  LEGACY_PLUGIN_MANIFEST_FILENAMES,
  LEGACY_PROJECT_NAMES,
  MACOS_APP_SOURCES_DIR,
  MANIFEST_KEY,
  PROJECT_NAME,
} from "./legacy-names.js";

describe("legacy-names constants", () => {
  describe("PROJECT_NAME", () => {
    it("exports the correct project name", () => {
      expect(PROJECT_NAME).toBe("openclaw");
    });

    it("is a const assertion", () => {
      const projectName = PROJECT_NAME as typeof PROJECT_NAME;
      expect(projectName).toBe("openclaw");
    });
  });

  describe("LEGACY_PROJECT_NAMES", () => {
    it("exports an empty array", () => {
      expect(LEGACY_PROJECT_NAMES).toEqual([]);
    });

    it("is a const assertion", () => {
      const legacyNames = LEGACY_PROJECT_NAMES as typeof LEGACY_PROJECT_NAMES;
      expect(legacyNames).toEqual([]);
    });
  });

  describe("MANIFEST_KEY", () => {
    it("matches PROJECT_NAME", () => {
      expect(MANIFEST_KEY).toBe(PROJECT_NAME);
    });

    it("exports the correct manifest key", () => {
      expect(MANIFEST_KEY).toBe("openclaw");
    });
  });

  describe("LEGACY_MANIFEST_KEYS", () => {
    it("matches LEGACY_PROJECT_NAMES", () => {
      expect(LEGACY_MANIFEST_KEYS).toEqual(LEGACY_PROJECT_NAMES);
    });

    it("exports an empty array", () => {
      expect(LEGACY_MANIFEST_KEYS).toEqual([]);
    });
  });

  describe("LEGACY_PLUGIN_MANIFEST_FILENAMES", () => {
    it("exports an empty array", () => {
      expect(LEGACY_PLUGIN_MANIFEST_FILENAMES).toEqual([]);
    });

    it("is a const assertion", () => {
      const filenames = LEGACY_PLUGIN_MANIFEST_FILENAMES as typeof LEGACY_PLUGIN_MANIFEST_FILENAMES;
      expect(filenames).toEqual([]);
    });
  });

  describe("MACOS_APP_SOURCES_DIR", () => {
    it("exports the correct macOS app sources directory", () => {
      expect(MACOS_APP_SOURCES_DIR).toBe("apps/macos/Sources/OpenClaw");
    });

    it("is a const assertion", () => {
      const sourcesDir = MACOS_APP_SOURCES_DIR as typeof MACOS_APP_SOURCES_DIR;
      expect(sourcesDir).toBe("apps/macos/Sources/OpenClaw");
    });
  });

  describe("LEGACY_MACOS_APP_SOURCES_DIRS", () => {
    it("exports an empty array", () => {
      expect(LEGACY_MACOS_APP_SOURCES_DIRS).toEqual([]);
    });

    it("is a const assertion", () => {
      const legacyDirs = LEGACY_MACOS_APP_SOURCES_DIRS as typeof LEGACY_MACOS_APP_SOURCES_DIRS;
      expect(legacyDirs).toEqual([]);
    });
  });

  describe("type consistency", () => {
    it("maintains type safety across related constants", () => {
      // These tests ensure the types are consistent and readonly
      const project = PROJECT_NAME;
      const manifest = MANIFEST_KEY;
      const sources = MACOS_APP_SOURCES_DIR;

      expect(typeof project).toBe("string");
      expect(typeof manifest).toBe("string");
      expect(typeof sources).toBe("string");

      expect(Array.isArray(LEGACY_PROJECT_NAMES)).toBe(true);
      expect(Array.isArray(LEGACY_MANIFEST_KEYS)).toBe(true);
      expect(Array.isArray(LEGACY_PLUGIN_MANIFEST_FILENAMES)).toBe(true);
      expect(Array.isArray(LEGACY_MACOS_APP_SOURCES_DIRS)).toBe(true);
    });
  });
});
