import { describe, expect, it, vi } from "vitest";
import { stylePromptMessage, stylePromptTitle, stylePromptHint } from "./prompt-style.js";

// Mock the theme module
vi.mock("./theme.js", () => ({
  isRich: vi.fn(),
  theme: {
    accent: vi.fn((text: string) => `ACCENT:${text}`),
    heading: vi.fn((text: string) => `HEADING:${text}`),
    muted: vi.fn((text: string) => `MUTED:${text}`),
  },
}));

describe("stylePromptMessage", () => {
  it("should apply accent styling when rich", () => {
    const { isRich, theme } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptMessage("Test message");

    expect(result).toBe("ACCENT:Test message");
    expect(theme.accent).toHaveBeenCalledWith("Test message");
  });

  it("should return plain text when not rich", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(false);

    const result = stylePromptMessage("Test message");

    expect(result).toBe("Test message");
  });

  it("should handle empty message", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptMessage("");

    expect(result).toBe("ACCENT:");
  });
});

describe("stylePromptTitle", () => {
  it("should apply heading styling when rich and title is provided", () => {
    const { isRich, theme } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptTitle("Test title");

    expect(result).toBe("HEADING:Test title");
    expect(theme.heading).toHaveBeenCalledWith("Test title");
  });

  it("should return plain title when not rich", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(false);

    const result = stylePromptTitle("Test title");

    expect(result).toBe("Test title");
  });

  it("should return undefined when title is not provided", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptTitle(undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined when title is null", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptTitle(null);

    expect(result).toBeUndefined();
  });

  it("should return undefined when title is empty string", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptTitle("");

    expect(result).toBeUndefined();
  });
});

describe("stylePromptHint", () => {
  it("should apply muted styling when rich and hint is provided", () => {
    const { isRich, theme } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptHint("Test hint");

    expect(result).toBe("MUTED:Test hint");
    expect(theme.muted).toHaveBeenCalledWith("Test hint");
  });

  it("should return plain hint when not rich", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(false);

    const result = stylePromptHint("Test hint");

    expect(result).toBe("Test hint");
  });

  it("should return undefined when hint is not provided", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptHint(undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined when hint is null", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptHint(null);

    expect(result).toBeUndefined();
  });

  it("should return undefined when hint is empty string", () => {
    const { isRich } = require("./theme.js");
    isRich.mockReturnValue(true);

    const result = stylePromptHint("");

    expect(result).toBeUndefined();
  });
});
