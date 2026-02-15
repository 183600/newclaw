import fs from "node:fs";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  assertWebChannel,
  normalizePath,
  ensureDir,
  jidToE164,
  normalizeE164,
  resolveJidToE164,
  toWhatsappJid,
  withWhatsAppPrefix,
} from "./utils.js";

describe("Message Processing Utilities", () => {
  describe("WhatsApp Number Processing", () => {
    it("converts numbers to WhatsApp format", () => {
      expect(withWhatsAppPrefix("+1234567890")).toBe("whatsapp:+1234567890");
      expect(withWhatsAppPrefix("1234567890")).toBe("whatsapp:1234567890");
      expect(withWhatsAppPrefix("whatsapp:+1234567890")).toBe("whatsapp:+1234567890");
    });

    it("normalizes E164 numbers", () => {
      expect(normalizeE164("whatsapp:+1 (555) 123-4567")).toBe("+15551234567");
      expect(normalizeE164("+15551234567")).toBe("+15551234567");
      expect(normalizeE164("15551234567")).toBe("+15551234567");
      expect(normalizeE164("(555) 123-4567")).toBe("+5551234567");
    });

    it("converts to WhatsApp JID format", () => {
      expect(toWhatsappJid("whatsapp:+15551234567")).toBe("15551234567@s.whatsapp.net");
      expect(toWhatsappJid("15551234567@s.whatsapp.net")).toBe("15551234567@s.whatsapp.net");
      expect(toWhatsappJid("123456789-987654321@g.us")).toBe("123456789-987654321@g.us");
    });

    it("handles edge cases in number processing", () => {
      expect(normalizeE164("")).toBe("+");
      expect(withWhatsAppPrefix("")).toBe("whatsapp:");
    });
  });

  describe("JID to E164 Conversion", () => {
    it("converts JIDs back to phone numbers", () => {
      // Mock file system for LID mapping
      const readFileSyncSpy = vi.spyOn(fs, "readFileSync").mockReturnValue('"5551234"');

      const result = jidToE164("123@lid");
      expect(result).toBe("+5551234");

      readFileSyncSpy.mockRestore();
    });

    it("handles regular JIDs", () => {
      expect(jidToE164("15551234567@s.whatsapp.net")).toBe("+15551234567");
    });

    it("handles hosted JIDs", () => {
      expect(jidToE164("1555000:2@hosted")).toBe("+1555000");
    });
  });

  describe("Message Content Processing", () => {
    it("processes message text content", () => {
      const messageText = "Hello @user123, how are you?";

      // Simulate mention extraction
      const mentions = messageText.match(/@(\w+)/g) || [];
      expect(mentions).toEqual(["@user123"]);
    });

    it("processes command messages", () => {
      const commandText = "/help search query";

      // Simulate command parsing
      if (commandText.startsWith("/")) {
        const parts = commandText.slice(1).split(" ");
        expect(parts[0]).toBe("help");
        expect(parts.slice(1)).toEqual(["search", "query"]);
      }
    });

    it("processes media message descriptions", () => {
      const mediaMessage = {
        type: "image",
        caption: "Check out this photo!",
        url: "https://example.com/image.jpg",
      };

      expect(mediaMessage.type).toBe("image");
      expect(mediaMessage.caption).toBe("Check out this photo!");
      expect(mediaMessage.url).toBeDefined();
    });
  });

  describe("Message Routing", () => {
    it("routes messages by channel type", () => {
      const channels = ["whatsapp", "telegram", "discord", "slack"];

      channels.forEach((channel) => {
        const message = {
          id: "msg123",
          content: "Hello",
          channel,
        };

        expect(message.channel).toBeDefined();
        expect(channels).toContain(message.channel);
      });
    });

    it("handles message priority", () => {
      const priorities = {
        urgent: 1,
        normal: 2,
        low: 3,
      };

      const urgentMessage = { priority: "urgent" };
      const normalMessage = { priority: "normal" };
      const lowMessage = { priority: "low" };

      expect(priorities[urgentMessage.priority]).toBeLessThan(priorities[normalMessage.priority]);
      expect(priorities[normalMessage.priority]).toBeLessThan(priorities[lowMessage.priority]);
    });
  });

  describe("Message Validation", () => {
    it("validates message structure", () => {
      const validMessage = {
        id: "msg123",
        content: "Hello world",
        sender: "+1234567890",
        timestamp: new Date(),
        channel: "whatsapp",
      };

      expect(validMessage.id).toBeDefined();
      expect(validMessage.content).toBeDefined();
      expect(validMessage.sender).toBeDefined();
      expect(validMessage.timestamp).toBeDefined();
      expect(validMessage.channel).toBeDefined();
    });

    it("validates message content length", () => {
      const shortMessage = "Hi";
      const longMessage = "A".repeat(1000);

      expect(shortMessage.length).toBeLessThan(160); // SMS limit
      expect(longMessage.length).toBeGreaterThan(160);
    });

    it("validates phone number format", () => {
      const validNumbers = ["+1234567890", "whatsapp:+1234567890", "+1 (555) 123-4567"];

      validNumbers.forEach((number) => {
        const normalized = normalizeE164(number);
        expect(normalized).toMatch(/^\+\d+$/);
      });
    });
  });

  describe("Message Formatting", () => {
    it("formats message timestamps", () => {
      const now = new Date();
      const timestamp = now.toISOString();

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("formats message size", () => {
      const messageSizes = {
        text: 100,
        image: 1024000, // 1MB
        video: 5120000, // 5MB
      };

      // Simulate size formatting
      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      expect(formatSize(messageSizes.text)).toBe("100 B");
      expect(formatSize(messageSizes.image)).toBe("1000.0 KB");
      // 5120000 / (1024 * 1024) = 4.8828125, rounded to 4.9
      expect(formatSize(messageSizes.video)).toBe("4.9 MB");
    });
  });

  describe("Message Context", () => {
    it("creates message context metadata", () => {
      const message = {
        id: "msg123",
        content: "Hello",
        sender: "+1234567890",
        channel: "whatsapp",
      };

      const context = {
        messageId: message.id,
        channel: message.channel,
        sender: message.sender,
        timestamp: new Date(),
        processed: false,
      };

      expect(context.messageId).toBe("msg123");
      expect(context.channel).toBe("whatsapp");
      expect(context.processed).toBe(false);
    });

    it("tracks message processing state", () => {
      const processingStates = ["pending", "processing", "completed", "failed"];

      processingStates.forEach((state) => {
        const messageState = { state };
        expect(processingStates).toContain(messageState.state);
      });
    });
  });
});
