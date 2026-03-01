#!/usr/bin/env bash
set -euo pipefail

cd /repo

export NEWCLAW_STATE_DIR="/tmp/newclaw-test"
export NEWCLAW_CONFIG_PATH="${NEWCLAW_STATE_DIR}/newclaw.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${NEWCLAW_STATE_DIR}/credentials"
mkdir -p "${NEWCLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${NEWCLAW_CONFIG_PATH}"
echo 'creds' >"${NEWCLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${NEWCLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm newclaw reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${NEWCLAW_CONFIG_PATH}"
test ! -d "${NEWCLAW_STATE_DIR}/credentials"
test ! -d "${NEWCLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${NEWCLAW_STATE_DIR}/credentials"
echo '{}' >"${NEWCLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm newclaw uninstall --state --yes --non-interactive

test ! -d "${NEWCLAW_STATE_DIR}"

echo "OK"
