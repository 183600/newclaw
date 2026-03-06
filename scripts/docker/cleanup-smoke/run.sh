#!/usr/bin/env bash
set -euo pipefail

cd /repo

export IFLOW_STATE_DIR="/tmp/claw-test"
export IFLOW_CONFIG_PATH="${IFLOW_STATE_DIR}/iflow.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${IFLOW_STATE_DIR}/credentials"
mkdir -p "${IFLOW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${IFLOW_CONFIG_PATH}"
echo 'creds' >"${IFLOW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${IFLOW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm claw reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${IFLOW_CONFIG_PATH}"
test ! -d "${IFLOW_STATE_DIR}/credentials"
test ! -d "${IFLOW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${IFLOW_STATE_DIR}/credentials"
echo '{}' >"${IFLOW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm claw uninstall --state --yes --non-interactive

test ! -d "${IFLOW_STATE_DIR}"

echo "OK"
