export type InlineDirectiveParseResult = {
  text: string;
  audioAsVoice: boolean;
  replyToId?: string;
  replyToExplicitId?: string;
  replyToCurrent: boolean;
  hasAudioTag: boolean;
  hasReplyTag: boolean;
};

type InlineDirectiveParseOptions = {
  currentMessageId?: string;
  stripAudioTag?: boolean;
  stripReplyTags?: boolean;
};

const AUDIO_TAG_RE = /\[\[\s*audio_as_voice\s*\]\]/gi;
const REPLY_TAG_RE = /\[\[\s*(?:reply_to_current|reply_to\s*:\s*([^\]\n]+))\s*(?:\]\]|$)/gi;

function normalizeDirectiveWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, " ") // Replace spaces and tabs with single space, but preserve newlines
    .trim();
}

export function parseInlineDirectives(
  text?: string,
  options: InlineDirectiveParseOptions = {},
): InlineDirectiveParseResult {
  const { currentMessageId, stripAudioTag = true, stripReplyTags = true } = options;
  if (!text) {
    return {
      text: "",
      audioAsVoice: false,
      replyToCurrent: false,
      hasAudioTag: false,
      hasReplyTag: false,
    };
  }

  let cleaned = text;
  let audioAsVoice = false;
  let hasAudioTag = false;
  let hasReplyTag = false;
  let sawCurrent = false;
  let lastExplicitId: string | undefined;

  cleaned = cleaned.replace(AUDIO_TAG_RE, (match) => {
    audioAsVoice = true;
    hasAudioTag = true;
    return stripAudioTag ? " " : match;
  });

  cleaned = cleaned.replace(REPLY_TAG_RE, (match, idRaw: string | undefined) => {
    hasReplyTag = true;
    if (idRaw === undefined) {
      sawCurrent = true;
    } else {
      const id = idRaw.trim();
      if (id) {
        lastExplicitId = id;
      }
    }
    return stripReplyTags ? " " : match;
  });

  // Always normalize whitespace in the final text
  // Replace spaces and tabs with single spaces, but preserve newlines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  // Trim leading/trailing spaces on each line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  // Trim leading/trailing newlines
  cleaned = cleaned.replace(/^\n+|\n+$/g, "");

  const replyToId =
    lastExplicitId ?? (sawCurrent ? currentMessageId?.trim() || undefined : undefined);

  return {
    text: cleaned,
    audioAsVoice,
    replyToId,
    replyToExplicitId: lastExplicitId,
    replyToCurrent: sawCurrent,
    hasAudioTag,
    hasReplyTag,
  };
}
