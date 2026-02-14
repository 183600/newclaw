// Debug script to understand the issue with normalizeMessageChannel
import { normalizeMessageChannel } from "./src/utils/message-channel.js";

console.log("Testing normalizeMessageChannel:");
console.log("tg ->", normalizeMessageChannel("tg"));
console.log("custom ->", normalizeMessageChannel("custom"));
console.log("cc ->", normalizeMessageChannel("cc"));
