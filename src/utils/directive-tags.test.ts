import { describe, it, expect } from "vitest";
import { parseInlineDirectives } from "./directive-tags";

describe("parseInlineDirectives", () => {
  it("should handle empty or undefined input", () => {
    expect(parseInlineDirectives()).toEqual({
      text: "",
      audioAsVoice: false,
      replyToCurrent: false,
      hasAudioTag: false,
      hasReplyTag: false,
    });

    expect(parseInlineDirectives("")).toEqual({
      text: "",
      audioAsVoice: false,
      replyToCurrent: false,
      hasAudioTag: false,
      hasReplyTag: false,
    });
  });

  it("should parse audio_as_voice directive", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]] world");
    expect(result).toEqual({
      text: "Hello world",
      audioAsVoice: true,
      replyToCurrent: false,
      hasAudioTag: true,
      hasReplyTag: false,
    });
  });

  it("should parse reply_to_current directive", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]] world");
    expect(result).toEqual({
      text: "Hello world",
      audioAsVoice: false,
      replyToCurrent: true,
      replyToId: undefined,
      hasAudioTag: false,
      hasReplyTag: true,
    });
  });

  it("should parse reply_to directive with explicit ID", () => {
    const result = parseInlineDirectives("Hello [[reply_to: msg123]] world");
    expect(result).toEqual({
      text: "Hello world",
      audioAsVoice: false,
      replyToCurrent: false,
      replyToId: "msg123",
      replyToExplicitId: "msg123",
      hasAudioTag: false,
      hasReplyTag: true,
    });
  });

  it("should handle multiple directives", () => {
    const result = parseInlineDirectives("[[audio_as_voice]] [[reply_to: msg123]] Hello world");
    expect(result).toEqual({
      text: "Hello world",
      audioAsVoice: true,
      replyToCurrent: false,
      replyToId: "msg123",
      replyToExplicitId: "msg123",
      hasAudioTag: true,
      hasReplyTag: true,
    });
  });

  it("should use currentMessageId for reply_to_current", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]]", {
      currentMessageId: "current-msg-456",
    });
    expect(result).toEqual({
      text: "Hello",
      audioAsVoice: false,
      replyToCurrent: true,
      replyToId: "current-msg-456",
      hasAudioTag: false,
      hasReplyTag: true,
    });
  });

  it("should prefer explicit reply_to ID over current", () => {
    const result = parseInlineDirectives("[[reply_to: explicit123]] [[reply_to_current]]", {
      currentMessageId: "current456",
    });
    expect(result).toEqual({
      text: "",
      audioAsVoice: false,
      replyToCurrent: true,
      replyToId: "explicit123",
      replyToExplicitId: "explicit123",
      hasAudioTag: false,
      hasReplyTag: true,
    });
  });

  it("should preserve directives when strip options are false", () => {
    const result = parseInlineDirectives("[[audio_as_voice]] [[reply_to: msg123]] Hello", {
      stripAudioTag: false,
      stripReplyTags: false,
    });
    expect(result.text).toBe("[[audio_as_voice]] [[reply_to: msg123]] Hello");
    expect(result.audioAsVoice).toBe(true);
    expect(result.replyToId).toBe("msg123");
  });

  it("should normalize whitespace", () => {
    const result = parseInlineDirectives("  Hello   world  [[audio_as_voice]]  ");
    expect(result.text).toBe("Hello world");
  });

  it("should handle malformed directives gracefully", () => {
    const result = parseInlineDirectives("Hello [[reply_to:]] world");
    expect(result).toEqual({
      text: "Hello [[reply_to:]] world",
      audioAsVoice: false,
      replyToCurrent: false,
      replyToId: undefined,
      replyToExplicitId: undefined,
      hasAudioTag: false,
      hasReplyTag: false,
    });
  });

  it("should handle case insensitive directives", () => {
    const result = parseInlineDirectives("[[AUDIO_AS_VOICE]] [[REPLY_TO: test123]] hello");
    expect(result.audioAsVoice).toBe(true);
    expect(result.replyToId).toBe("test123");
    expect(result.hasAudioTag).toBe(true);
    expect(result.hasReplyTag).toBe(true);
  });

  it("should handle directives with extra whitespace", () => {
    const result = parseInlineDirectives("[[  audio_as_voice  ]] [[  reply_to  :  msg123  ]] text");
    expect(result.audioAsVoice).toBe(true);
    expect(result.replyToId).toBe("msg123");
  });
});
