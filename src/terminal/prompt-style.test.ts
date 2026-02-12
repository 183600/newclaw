import { describe, expect, it, vi, beforeEach } from "vitest";
import { stylePromptMessage, stylePromptTitle, stylePromptHint } from "./prompt-style.js";

// Mock the theme module
vi.mock("./theme.js", () => ({
  isRich: vi.fn(),
  theme: {
    accent: vi.fn((text: string) => `accent(${text})`),
    heading: vi.fn((text: string) => `heading(${text})`),
    muted: vi.fn((text: string) => `muted(${text})`),
  },
}));

describe("stylePromptMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply accent styling when rich mode is enabled", async () => {
    const { isRich, theme } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(true);

    const message = "Test message";
    const result = stylePromptMessage(message);

    expect(isRich).toHaveBeenCalled();
    expect(theme.accent).toHaveBeenCalledWith(message);
    expect(result).toBe("accent(Test message)");
  });

  it("should return plain message when rich mode is disabled", async () => {
    const { isRich } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(false);

    const message = "Test message";
    const result = stylePromptMessage(message);

    expect(isRich).toHaveBeenCalled();
    expect(result).toBe(message);
  });
});

describe("stylePromptTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply heading styling when rich mode is enabled and title is provided", async () => {
    const { isRich, theme } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(true);

    const title = "Test Title";
    const result = stylePromptTitle(title);

    expect(isRich).toHaveBeenCalled();
    expect(theme.heading).toHaveBeenCalledWith(title);
    expect(result).toBe("heading(Test Title)");
  });

  it("should return plain title when rich mode is disabled", async () => {
    const { isRich } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(false);

    const title = "Test Title";
    const result = stylePromptTitle(title);

    expect(isRich).toHaveBeenCalled();
    expect(result).toBe(title);
  });

  it("should return undefined when no title is provided", () => {
    const result = stylePromptTitle(undefined);
    expect(result).toBeUndefined();
  });
});

describe("stylePromptHint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply muted styling when rich mode is enabled and hint is provided", async () => {
    const { isRich, theme } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(true);

    const hint = "Test Hint";
    const result = stylePromptHint(hint);

    expect(isRich).toHaveBeenCalled();
    expect(theme.muted).toHaveBeenCalledWith(hint);
    expect(result).toBe("muted(Test Hint)");
  });

  it("should return plain hint when rich mode is disabled", async () => {
    const { isRich } = await import("./theme.js");
    vi.mocked(isRich).mockReturnValue(false);

    const hint = "Test Hint";
    const result = stylePromptHint(hint);

    expect(isRich).toHaveBeenCalled();
    expect(result).toBe(hint);
  });

  it("should return undefined when no hint is provided", () => {
    const result = stylePromptHint(undefined);
    expect(result).toBeUndefined();
  });
});
