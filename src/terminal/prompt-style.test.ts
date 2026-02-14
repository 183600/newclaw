import { describe, expect, it, vi, beforeEach } from "vitest";
import { stylePromptMessage, stylePromptTitle, stylePromptHint } from "./prompt-style.js";

// Create mocks using vi.hoisted
const { mockIsRich, mockTheme } = vi.hoisted(() => ({
  mockIsRich: vi.fn(),
  mockTheme: {
    accent: vi.fn((text: string) => `ACCENT:${text}`),
    heading: vi.fn((text: string) => `HEADING:${text}`),
    muted: vi.fn((text: string) => `MUTED:${text}`),
  },
}));

// Mock the theme module
vi.mock("./theme.js", () => ({
  isRich: mockIsRich,
  theme: mockTheme,
}));

describe("stylePromptMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply accent styling when rich", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptMessage("Test message");

    expect(result).toBe("ACCENT:Test message");
    expect(mockTheme.accent).toHaveBeenCalledWith("Test message");
  });

  it("should return plain text when not rich", () => {
    mockIsRich.mockReturnValue(false);

    const result = stylePromptMessage("Test message");

    expect(result).toBe("Test message");
  });

  it("should handle empty message", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptMessage("");

    expect(result).toBe("ACCENT:");
  });
});

describe("stylePromptTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply heading styling when rich and title is provided", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptTitle("Test title");

    expect(result).toBe("HEADING:Test title");
    expect(mockTheme.heading).toHaveBeenCalledWith("Test title");
  });

  it("should return plain title when not rich", () => {
    mockIsRich.mockReturnValue(false);

    const result = stylePromptTitle("Test title");

    expect(result).toBe("Test title");
  });

  it("should return undefined when title is not provided", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptTitle(undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined when title is null", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptTitle(null);

    expect(result).toBeUndefined();
  });

  it("should return undefined when title is empty string", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptTitle("");

    expect(result).toBeUndefined();
  });
});

describe("stylePromptHint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply muted styling when rich and hint is provided", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptHint("Test hint");

    expect(result).toBe("MUTED:Test hint");
    expect(mockTheme.muted).toHaveBeenCalledWith("Test hint");
  });

  it("should return plain hint when not rich", () => {
    mockIsRich.mockReturnValue(false);

    const result = stylePromptHint("Test hint");

    expect(result).toBe("Test hint");
  });

  it("should return undefined when hint is not provided", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptHint(undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined when hint is null", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptHint(null);

    expect(result).toBeUndefined();
  });

  it("should return undefined when hint is empty string", () => {
    mockIsRich.mockReturnValue(true);

    const result = stylePromptHint("");

    expect(result).toBeUndefined();
  });
});
