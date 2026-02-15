import { describe, expect, it } from "vitest";
import { parseInlineDirectives } from "./directive-tags.js";

describe("parseInlineDirectives - Additional Tests", () => {
  it("should handle malformed audio directive with extra brackets", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]]] world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello ] world");
  });

  it("should handle reply_to directive with special characters", () => {
    const result = parseInlineDirectives("Hello [[reply_to: msg-123_456]] world");
    expect(result.replyToId).toBe("msg-123_456");
    expect(result.replyToExplicitId).toBe("msg-123_456");
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle nested directives in complex text", () => {
    const result = parseInlineDirectives(
      "Start [[audio_as_voice]] middle [[reply_to: msg123]] end [[reply_to_current]]",
    );
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Start middle end");
  });

  it("should handle directives with Unicode whitespace", () => {
    const result = parseInlineDirectives("Hello [[\u00A0audio_as_voice\u00A0]] world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should preserve newlines when stripReplyTags is false", () => {
    const result = parseInlineDirectives("Line1\n[[reply_to: msg123]]\nLine2", {
      stripReplyTags: false,
    });
    expect(result.replyToId).toBe("msg123");
    expect(result.text).toBe("Line1\n[[reply_to: msg123]]\nLine2");
  });

  it("should handle empty currentMessageId", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]] world", {
      currentMessageId: "",
    });
    expect(result.replyToId).toBeUndefined();
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
  });

  it("should handle directive at start of text", () => {
    const result = parseInlineDirectives("[[audio_as_voice]] Hello world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle directive at end of text", () => {
    const result = parseInlineDirectives("Hello world [[reply_to: msg123]]");
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle multiple consecutive directives", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]][[reply_to: msg123]] world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle directive with only whitespace", () => {
    const result = parseInlineDirectives("Hello [[   ]] world");
    expect(result.audioAsVoice).toBe(false);
    expect(result.hasAudioTag).toBe(false);
    expect(result.hasReplyTag).toBe(false);
    expect(result.text).toBe("Hello [[ ]] world");
  });
});
