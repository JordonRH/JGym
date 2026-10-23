#!/usr/bin/env bash
set -euo pipefail

if [[ ! -x /runner/run.sh ]]; then
  cp -a /runner-template/. /runner/
fi

if [[ ! -f /runner/.runner ]]; then
  : "${RUNNER_URL:?RUNNER_URL is required}"
  : "${RUNNER_TOKEN:?RUNNER_TOKEN is required for first-time registration}"
  /runner/config.sh \
    --url "$RUNNER_URL" \
    --token "$RUNNER_TOKEN" \
    --name "${RUNNER_NAME:-jgym-docker-host}" \
    --labels "${RUNNER_LABELS:-jgym-deploy}" \
    --work /runner/_work \
    --unattended \
    --replace
fi

unset RUNNER_TOKEN
exec /runner/run.sh
