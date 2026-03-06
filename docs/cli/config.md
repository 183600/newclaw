---
summary: "CLI reference for `iflow config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `iflow config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `iflow configure`).

## Examples

```bash
iflow config get browser.executablePath
iflow config set browser.executablePath "/usr/bin/google-chrome"
iflow config set agents.defaults.heartbeat.every "2h"
iflow config set agents.list[0].tools.exec.node "node-id-or-name"
iflow config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
iflow config get agents.defaults.workspace
iflow config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
iflow config get agents.list
iflow config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
iflow config set agents.defaults.heartbeat.every "0m"
iflow config set gateway.port 19001 --json
iflow config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
