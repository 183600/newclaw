# Google Antigravity Auth (iFlow plugin)

OAuth provider plugin for **Google Antigravity** (Cloud Code Assist).

## Enable

Bundled plugins are disabled by default. Enable this one:

```bash
iflow plugins enable google-antigravity-auth
```

Restart the Gateway after enabling.

## Authenticate

```bash
iflow models auth login --provider google-antigravity --set-default
```

## Notes

- Antigravity uses Google Cloud project quotas.
- If requests fail, ensure Gemini for Google Cloud is enabled.
