---
summary: "CLI reference for `newclaw agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `newclaw agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
newclaw agents list
newclaw agents add work --workspace ~/.newclaw/workspace-work
newclaw agents set-identity --workspace ~/.newclaw/workspace --from-identity
newclaw agents set-identity --agent main --avatar avatars/newclaw.png
newclaw agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.newclaw/workspace/IDENTITY.md`
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
newclaw agents set-identity --workspace ~/.newclaw/workspace --from-identity
```

Override fields explicitly:

```bash
newclaw agents set-identity --agent main --name "NewClaw" --emoji "🦞" --avatar avatars/newclaw.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "NewClaw",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/newclaw.png",
        },
      },
    ],
  },
}
```
