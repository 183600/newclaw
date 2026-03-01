---
summary: "CLI reference for `newclaw config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `newclaw config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `newclaw configure`).

## Examples

```bash
newclaw config get browser.executablePath
newclaw config set browser.executablePath "/usr/bin/google-chrome"
newclaw config set agents.defaults.heartbeat.every "2h"
newclaw config set agents.list[0].tools.exec.node "node-id-or-name"
newclaw config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
newclaw config get agents.defaults.workspace
newclaw config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
newclaw config get agents.list
newclaw config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
newclaw config set agents.defaults.heartbeat.every "0m"
newclaw config set gateway.port 19001 --json
newclaw config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
