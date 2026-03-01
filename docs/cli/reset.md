---
summary: "CLI reference for `newclaw reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `newclaw reset`

Reset local config/state (keeps the CLI installed).

```bash
newclaw reset
newclaw reset --dry-run
newclaw reset --scope config+creds+sessions --yes --non-interactive
```
