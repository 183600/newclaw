---
summary: "CLI reference for `iflow reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `iflow reset`

Reset local config/state (keeps the CLI installed).

```bash
iflow reset
iflow reset --dry-run
iflow reset --scope config+creds+sessions --yes --non-interactive
```
