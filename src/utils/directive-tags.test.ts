import { describe, expect, it } from "vitest";
import { parseInlineDirectives } from "./directive-tags.js";

describe("parseInlineDirectives", () => {
  it("should return empty result for undefined input", () => {
    const result = parseInlineDirectives(undefined);
    expect(result).toEqual({
      text: "",
      audioAsVoice: false,
      replyToCurrent: false,
      hasAudioTag: false,
      hasReplyTag: false,
    });
  });

  it("should return empty result for empty string input", () => {
    const result = parseInlineDirectives("");
    const expected = {
      text: "",
      audioAsVoice: false,
      replyToCurrent: false,
      hasAudioTag: false,
      hasReplyTag: false,
    };
    expect(result).toEqual(expected);
  });

  it("should parse audio_as_voice directive", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]] world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should parse reply_to_current directive", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]] world");
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should parse reply_to directive with ID", () => {
    const result = parseInlineDirectives("Hello [[reply_to: msg123]] world");
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle multiple directives", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]] world [[reply_to: msg123]] end");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world end");
  });

  it("should use currentMessageId for reply_to_current", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]] world", {
      currentMessageId: "current123",
    });
    expect(result.replyToId).toBe("current123");
    expect(result.replyToExplicitId).toBeUndefined();
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
  });

  it("should prioritize explicit reply_to ID over reply_to_current", () => {
    const result = parseInlineDirectives(
      "Hello [[reply_to_current]] [[reply_to: explicit123]] world",
      {
        currentMessageId: "current123",
      },
    );
    expect(result.replyToId).toBe("explicit123");
    expect(result.replyToExplicitId).toBe("explicit123");
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
  });

  it("should handle whitespace in directives", () => {
    const result = parseInlineDirectives(
      "Hello [[  audio_as_voice  ]] [[  reply_to  :  msg123  ]] world",
    );
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle empty reply_to ID", () => {
    const result = parseInlineDirectives("Hello [[reply_to: ]] world");
    expect(result.replyToId).toBeUndefined();
    expect(result.replyToExplicitId).toBeUndefined();
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle reply_to ID with whitespace", () => {
    const result = parseInlineDirectives("Hello [[reply_to:  msg123  ]] world");
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should preserve audio tag when stripAudioTag is false", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]] world", {
      stripAudioTag: false,
    });
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello [[audio_as_voice]] world");
  });

  it("should preserve reply tags when stripReplyTags is false", () => {
    const result = parseInlineDirectives("Hello [[reply_to: msg123]] world", {
      stripReplyTags: false,
    });
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello [[reply_to: msg123]] world");
  });

  it("should normalize whitespace in text", () => {
    const result = parseInlineDirectives("Hello   \t  world  \n  end");
    expect(result.text).toBe("Hello world end");
  });

  it("should handle case-insensitive audio directive", () => {
    const result = parseInlineDirectives("Hello [[AUDIO_AS_VOICE]] world");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello world");
  });

  it("should handle multiple audio directives", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice]] world [[audio_as_voice]] end");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.text).toBe("Hello world end");
  });

  it("should handle multiple reply directives", () => {
    const result = parseInlineDirectives("Hello [[reply_to: msg1]] world [[reply_to: msg2]] end");
    expect(result.replyToId).toBe("msg2");
    expect(result.replyToExplicitId).toBe("msg2");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world end");
  });

  it("should handle mixed reply directives", () => {
    const result = parseInlineDirectives(
      "Hello [[reply_to_current]] world [[reply_to: msg123]] end",
      {
        currentMessageId: "current123",
      },
    );
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello world end");
  });

  it("should trim currentMessageId", () => {
    const result = parseInlineDirectives("Hello [[reply_to_current]]", {
      currentMessageId: "  current123  ",
    });
    expect(result.replyToId).toBe("current123");
    expect(result.replyToExplicitId).toBeUndefined();
    expect(result.replyToCurrent).toBe(true);
    expect(result.hasReplyTag).toBe(true);
  });

  it("should handle text with only directives", () => {
    const result = parseInlineDirectives("[[audio_as_voice]] [[reply_to: msg123]]");
    expect(result.audioAsVoice).toBe(true);
    expect(result.hasAudioTag).toBe(true);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("");
  });

  it("should handle malformed directives", () => {
    const result = parseInlineDirectives("Hello [[audio_as_voice world [[reply_to: msg123");
    expect(result.audioAsVoice).toBe(false);
    expect(result.hasAudioTag).toBe(false);
    expect(result.replyToId).toBe("msg123");
    expect(result.replyToExplicitId).toBe("msg123");
    expect(result.replyToCurrent).toBe(false);
    expect(result.hasReplyTag).toBe(true);
    expect(result.text).toBe("Hello [[audio_as_voice world");
  });
});
