---
summary: "CLI reference for `iflow agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `iflow agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
iflow agents list
iflow agents add work --workspace ~/.iflow/workspace-work
iflow agents set-identity --workspace ~/.iflow/workspace --from-identity
iflow agents set-identity --agent main --avatar avatars/iflow.png
iflow agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.iflow/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
iflow agents set-identity --workspace ~/.iflow/workspace --from-identity
```

Override fields explicitly:

```bash
iflow agents set-identity --agent main --name "iFlow" --emoji "🦞" --avatar avatars/iflow.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "iFlow",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/iflow.png",
        },
      },
    ],
  },
}
```
