import { isRich, theme } from "./theme.js";

export const stylePromptMessage = (message: string): string =>
  isRich() ? theme.accent(message) : message;

export const stylePromptTitle = (title?: string): string | undefined =>
  title && title.trim() ? (isRich() ? theme.heading(title) : title) : undefined;

export const stylePromptHint = (hint?: string): string | undefined =>
  hint && hint.trim() ? (isRich() ? theme.muted(hint) : hint) : undefined;
