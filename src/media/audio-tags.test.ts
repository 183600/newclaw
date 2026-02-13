import { describe, expect, it, vi } from "vitest";
import { parseAudioTag } from "./audio-tags.js";

// Mock the directive-tags module
vi.mock("../utils/directive-tags.js", () => ({
  parseInlineDirectives: vi.fn(),
}));

import { parseInlineDirectives } from "../utils/directive-tags.js";

describe("parseAudioTag", () => {
  it("returns parsed directive results", () => {
    const mockText = "Test audio content";
    const mockResult = {
      text: mockText,
      audioAsVoice: true,
      hasAudioTag: true,
    };

    vi.mocked(parseInlineDirectives).mockReturnValue(mockResult);

    const result = parseAudioTag(mockText);

    expect(result).toEqual({
      text: mockText,
      audioAsVoice: true,
      hadTag: true,
    });
    expect(parseInlineDirectives).toHaveBeenCalledWith(mockText, { stripReplyTags: false });
  });

  it("handles undefined input", () => {
    const mockResult = {
      text: "",
      audioAsVoice: false,
      hasAudioTag: false,
    };

    vi.mocked(parseInlineDirectives).mockReturnValue(mockResult);

    const result = parseAudioTag(undefined);

    expect(result).toEqual({
      text: "",
      audioAsVoice: false,
      hadTag: false,
    });
    expect(parseInlineDirectives).toHaveBeenCalledWith(undefined, { stripReplyTags: false });
  });

  it("maps hasAudioTag to hadTag correctly", () => {
    const mockText = "Content without audio tag";
    const mockResult = {
      text: mockText,
      audioAsVoice: false,
      hasAudioTag: false,
    };

    vi.mocked(parseInlineDirectives).mockReturnValue(mockResult);

    const result = parseAudioTag(mockText);

    expect(result.hadTag).toBe(false);
  });

  it("preserves audioAsVoice setting from directive parser", () => {
    const mockText = "Content with voice audio";
    const mockResult = {
      text: mockText,
      audioAsVoice: true,
      hasAudioTag: true,
    };

    vi.mocked(parseInlineDirectives).mockReturnValue(mockResult);

    const result = parseAudioTag(mockText);

    expect(result.audioAsVoice).toBe(true);
  });
});
