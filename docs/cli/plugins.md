---
summary: "CLI reference for `iflow plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
title: "plugins"
---

# `iflow plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:

- Plugin system: [Plugins](/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
iflow plugins list
iflow plugins info <id>
iflow plugins enable <id>
iflow plugins disable <id>
iflow plugins doctor
iflow plugins update <id>
iflow plugins update --all
```

Bundled plugins ship with iFlow but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `iflow.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
iflow plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
iflow plugins install -l ./my-plugin
```

### Update

```bash
iflow plugins update <id>
iflow plugins update --all
iflow plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
