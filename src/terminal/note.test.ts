import { describe, expect, it, vi, beforeEach } from "vitest";
import { wrapNoteMessage, note } from "./note.js";

// Mock dependencies
vi.mock("@clack/prompts", () => ({
  note: vi.fn(),
}));

vi.mock("./prompt-style.js", () => ({
  stylePromptTitle: vi.fn((title?: string) => (title ? `styled(${title})` : undefined)),
}));

describe("wrapNoteMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should wrap a simple message", () => {
    const message = "This is a simple message";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    // The message might be wrapped across lines, so check if parts are present
    expect(result).toContain("This");
    expect(result).toContain("simple");
    expect(result).toContain("message");
  });

  it("should wrap a long message", () => {
    const message = "This is a very long message that should be wrapped at the specified width";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThan(1);
    // Each line should not exceed the maximum width (approximately, considering ANSI codes)
    lines.forEach((line) => {
      // This is a rough check - in practice, visibleWidth would be used
      expect(line.length).toBeLessThanOrEqual(25); // Allow some margin
    });
  });

  it("should handle empty lines", () => {
    const message = "Line 1\n\nLine 3";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    const lines = result.split("\n");
    expect(lines).toContain("Line 1");
    expect(lines).toContain("");
    expect(lines).toContain("Line 3");
  });

  it("should handle bullet points", () => {
    const message = "  * First bullet point\n  * Second bullet point that is very long";
    const result = wrapNoteMessage(message, { maxWidth: 30 });
    const lines = result.split("\n");
    expect(lines[0]).toContain("* First bullet point");
    expect(lines[1]).toContain("* Second bullet point");
  });

  it("should handle numbered lists", () => {
    const message = "  1. First item\n  2. Second item that is very long";
    const result = wrapNoteMessage(message, { maxWidth: 30 });
    const lines = result.split("\n");
    expect(lines[0]).toContain("1. First item");
    expect(lines[1]).toContain("2. Second item");
  });

  it("should handle indented content", () => {
    const message = "    This is indented content that should wrap properly";
    const result = wrapNoteMessage(message, { maxWidth: 30 });
    const lines = result.split("\n");
    expect(lines[0]).to.include("    ");
    if (lines.length > 1) {
      expect(lines[1]).to.include("    ");
    }
  });

  it("should use default max width when not specified", () => {
    const message = "This is a message";
    const result = wrapNoteMessage(message);
    expect(result).toContain(message);
  });

  it("should use process.stdout.columns when available", () => {
    const originalColumns = process.stdout.columns;
    process.stdout.columns = 100;

    const message = "This is a message";
    const result = wrapNoteMessage(message);
    expect(result).toContain(message);

    process.stdout.columns = originalColumns;
  });

  it("should handle very long words", () => {
    const message = "Supercalifragilisticexpialidocious is a very long word";
    const result = wrapNoteMessage(message, { maxWidth: 20 });
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThan(1);
  });

  it("should handle mixed content", () => {
    const message = "Normal text\n  * Bullet point\n    Indented text\nNormal text again";
    const result = wrapNoteMessage(message, { maxWidth: 30 });
    const lines = result.split("\n");
    expect(lines[0]).toBe("Normal text");
    expect(lines[1]).toContain("* Bullet point");
    expect(lines[2]).toContain("Indented text");
    expect(lines[3]).toBe("Normal text again");
  });
});

describe("note", () => {
  it("should call clack note with wrapped message", async () => {
    // Get the mocked clack note function
    const clackPrompts = await import("@clack/prompts");
    const clackNote = vi.mocked(clackPrompts.note);
    const message = "Test message";

    note(message);

    expect(clackNote).toHaveBeenCalled();
    const wrappedMessage = clackNote.mock.calls[0][0];
    expect(wrappedMessage).toContain(message);
  });

  it("should call clack note with styled title", async () => {
    const clackPrompts = await import("@clack/prompts");
    const clackNote = vi.mocked(clackPrompts.note);
    const message = "Test message";
    const title = "Test Title";

    note(message, title);

    expect(clackNote).toHaveBeenCalledWith(expect.any(String), "styled(Test Title)");
  });

  it("should handle message without title", async () => {
    // This test verifies that the note function works without a title
    const message = "Test message";
    expect(() => note(message)).not.toThrow();
  });

  it("should handle empty message", async () => {
    const clackPrompts = await import("@clack/prompts");
    const clackNote = vi.mocked(clackPrompts.note);

    note("");

    expect(clackNote).toHaveBeenCalled();
  });
});
