---
summary: "CLI reference for `iflow logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `iflow logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
iflow logs
iflow logs --follow
iflow logs --json
iflow logs --limit 500
```
