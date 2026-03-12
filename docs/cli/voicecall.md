---
summary: "CLI reference for `newclaw voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `newclaw voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
newclaw voicecall status --call-id <id>
newclaw voicecall call --to "+15555550123" --message "Hello" --mode notify
newclaw voicecall continue --call-id <id> --message "Any questions?"
newclaw voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
newclaw voicecall expose --mode serve
newclaw voicecall expose --mode funnel
newclaw voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
