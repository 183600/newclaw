---
summary: "CLI reference for `iflow voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `iflow voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
iflow voicecall status --call-id <id>
iflow voicecall call --to "+15555550123" --message "Hello" --mode notify
iflow voicecall continue --call-id <id> --message "Any questions?"
iflow voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
iflow voicecall expose --mode serve
iflow voicecall expose --mode funnel
iflow voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
