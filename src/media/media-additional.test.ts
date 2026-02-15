import { describe, expect, it } from "vitest";
import { isVoiceCompatibleAudio } from "./audio.js";
import { MediaKind } from "./constants.js";
import { getFileExtension, isAudioFileName, isGifMedia, kindFromMime } from "./mime.js";

describe("audio detection", () => {
  describe("isVoiceCompatibleAudio", () => {
    it("detects voice compatible audio from MIME type", () => {
      expect(isVoiceCompatibleAudio({ contentType: "audio/ogg" })).toBe(true);
      expect(isVoiceCompatibleAudio({ contentType: "audio/opus" })).toBe(true);
      expect(isVoiceCompatibleAudio({ contentType: "AUDIO/OGG" })).toBe(true);
      expect(isVoiceCompatibleAudio({ contentType: "AUDIO/OPUS" })).toBe(true);
    });

    it("detects voice compatible audio from file name", () => {
      expect(isVoiceCompatibleAudio({ fileName: "audio.oga" })).toBe(true);
      expect(isVoiceCompatibleAudio({ fileName: "audio.ogg" })).toBe(true);
      expect(isVoiceCompatibleAudio({ fileName: "audio.opus" })).toBe(true);
      expect(isVoiceCompatibleAudio({ fileName: "AUDIO.OGA" })).toBe(true);
    });

    it("rejects non-voice compatible formats", () => {
      expect(isVoiceCompatibleAudio({ contentType: "audio/mp3" })).toBe(false);
      expect(isVoiceCompatibleAudio({ contentType: "audio/mpeg" })).toBe(false);
      expect(isVoiceCompatibleAudio({ fileName: "audio.mp3" })).toBe(false);
      expect(isVoiceCompatibleAudio({ fileName: "audio.wav" })).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isVoiceCompatibleAudio({})).toBe(false);
      expect(isVoiceCompatibleAudio({ contentType: null, fileName: null })).toBe(false);
      expect(isVoiceCompatibleAudio({ contentType: "", fileName: "" })).toBe(false);
      expect(isVoiceCompatibleAudio({ fileName: "   " })).toBe(false);
    });

    it("prefers MIME type over file extension", () => {
      expect(
        isVoiceCompatibleAudio({
          contentType: "audio/ogg",
          fileName: "audio.mp3",
        }),
      ).toBe(true);
    });
  });
});

describe("file extension utilities", () => {
  describe("getFileExtension", () => {
    it("extracts extensions from file paths", () => {
      expect(getFileExtension("file.txt")).toBe(".txt");
      expect(getFileExtension("document.pdf")).toBe(".pdf");
      expect(getFileExtension("image.jpeg")).toBe(".jpeg");
      expect(getFileExtension("archive.tar.gz")).toBe(".gz");
    });

    it("handles URLs", () => {
      expect(getFileExtension("https://example.com/file.mp3")).toBe(".mp3");
      expect(getFileExtension("http://test.org/image.png?size=large")).toBe(".png");
      expect(getFileExtension("https://site.com/path/to/video.mov")).toBe(".mov");
    });

    it("handles edge cases", () => {
      expect(getFileExtension("")).toBeUndefined();
      expect(getFileExtension("filename")).toBeUndefined();
      expect(getFileExtension("filename.")).toBeUndefined();
      expect(getFileExtension(".hiddenfile")).toBeUndefined();
      expect(getFileExtension(null)).toBeUndefined();
      expect(getFileExtension(undefined)).toBeUndefined();
    });

    it("handles invalid URLs gracefully", () => {
      expect(getFileExtension("https://[invalid-url")).toBeUndefined();
      expect(getFileExtension("http://")).toBeUndefined();
    });
  });

  describe("isAudioFileName", () => {
    it("identifies audio files by extension", () => {
      expect(isAudioFileName("song.mp3")).toBe(true);
      expect(isAudioFileName("track.wav")).toBe(true);
      expect(isAudioFileName("audio.flac")).toBe(true);
      expect(isAudioFileName("voice.opus")).toBe(true);
      expect(isAudioFileName("sound.m4a")).toBe(true);
      expect(isAudioFileName("music.aac")).toBe(true);
      expect(isAudioFileName("recording.oga")).toBe(true);
      expect(isAudioFileName("clip.ogg")).toBe(true);
    });

    it("rejects non-audio files", () => {
      expect(isAudioFileName("image.jpg")).toBe(false);
      expect(isAudioFileName("document.pdf")).toBe(false);
      expect(isAudioFileName("video.mp4")).toBe(false);
      expect(isAudioFileName("text.txt")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isAudioFileName("")).toBeUndefined();
      expect(isAudioFileName(null)).toBeUndefined();
      expect(isAudioFileName("audio")).toBeUndefined();
      expect(isAudioFileName("audio.")).toBeUndefined();
    });
  });
});

describe("media type detection", () => {
  describe("isGifMedia", () => {
    it("identifies GIF by MIME type", () => {
      expect(isGifMedia({ contentType: "image/gif" })).toBe(true);
      expect(isGifMedia({ contentType: "IMAGE/GIF" })).toBe(true);
    });

    it("identifies GIF by file extension", () => {
      expect(isGifMedia({ fileName: "animation.gif" })).toBe(true);
      expect(isGifMedia({ fileName: "ANIMATION.GIF" })).toBe(true);
    });

    it("rejects non-GIF media", () => {
      expect(isGifMedia({ contentType: "image/png" })).toBe(false);
      expect(isGifMedia({ contentType: "image/jpeg" })).toBe(false);
      expect(isGifMedia({ fileName: "image.jpg" })).toBe(false);
      expect(isGifMedia({ fileName: "video.mp4" })).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isGifMedia({})).toBe(false);
      expect(isGifMedia({ contentType: null, fileName: null })).toBe(false);
      expect(isGifMedia({ contentType: "", fileName: "" })).toBe(false);
    });
  });

  describe("kindFromMime", () => {
    it("categorizes image MIME types", () => {
      expect(kindFromMime("image/jpeg")).toBe(MediaKind.Image);
      expect(kindFromMime("image/png")).toBe(MediaKind.Image);
      expect(kindFromMime("image/gif")).toBe(MediaKind.Image);
      expect(kindFromMime("image/webp")).toBe(MediaKind.Image);
    });

    it("categorizes audio MIME types", () => {
      expect(kindFromMime("audio/mpeg")).toBe(MediaKind.Audio);
      expect(kindFromMime("audio/ogg")).toBe(MediaKind.Audio);
      expect(kindFromMime("audio/wav")).toBe(MediaKind.Audio);
      expect(kindFromMime("audio/mp4")).toBe(MediaKind.Audio);
    });

    it("categorizes video MIME types", () => {
      expect(kindFromMime("video/mp4")).toBe(MediaKind.Video);
      expect(kindFromMime("video/quicktime")).toBe(MediaKind.Video);
      expect(kindFromMime("video/webm")).toBe(MediaKind.Video);
    });

    it("categorizes document MIME types", () => {
      expect(kindFromMime("application/pdf")).toBe(MediaKind.Document);
      expect(kindFromMime("text/plain")).toBe(MediaKind.Document);
      expect(kindFromMime("text/markdown")).toBe(MediaKind.Document);
    });

    it("handles unknown MIME types", () => {
      expect(kindFromMime("application/unknown")).toBe(MediaKind.Unknown);
      expect(kindFromMime("x-custom/type")).toBe(MediaKind.Unknown);
    });

    it("handles edge cases", () => {
      expect(kindFromMime("")).toBe(MediaKind.Unknown);
      expect(kindFromMime(null)).toBe(MediaKind.Unknown);
      expect(kindFromMime(undefined)).toBe(MediaKind.Unknown);
    });
  });
});

describe("media integration tests", () => {
  it("correctly identifies voice audio files", () => {
    const voiceFile = "recording.opus";
    expect(isAudioFileName(voiceFile)).toBe(true);
    expect(isVoiceCompatibleAudio({ fileName: voiceFile })).toBe(true);
  });

  it("correctly identifies non-voice audio files", () => {
    const audioFile = "music.mp3";
    expect(isAudioFileName(audioFile)).toBe(true);
    expect(isVoiceCompatibleAudio({ fileName: audioFile })).toBe(false);
  });

  it("correctly identifies GIF media", () => {
    const gifFile = "animation.gif";
    expect(isGifMedia({ fileName: gifFile })).toBe(true);
    expect(kindFromMime("image/gif")).toBe(MediaKind.Image);
  });

  it("handles complex file paths", () => {
    const complexPath = "/path/to/voice message.opus";
    expect(isVoiceCompatibleAudio({ fileName: complexPath })).toBe(true);
  });

  it("handles URLs with media files", () => {
    const imageUrl = "https://example.com/image.gif";
    expect(isGifMedia({ fileName: imageUrl })).toBe(true);
    expect(getFileExtension(imageUrl)).toBe(".gif");
  });
});
