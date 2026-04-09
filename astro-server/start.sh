#!/bin/sh
set -eu

node ./dist/server/entry.mjs &
ASTRO_PID=$!

echo "Waiting for Astro to be ready..."
i=0
until curl -sf http://localhost:4321/ > /dev/null 2>&1; do
  i=$((i + 1))
  if [ $i -ge 60 ]; then
    echo "Astro did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done
echo "Astro ready."

if [ -n "${VARNISH_URL:-}" ] && [ -n "${PURGE_TOKEN:-}" ]; then
  echo "Purging Varnish cache..."
  curl -fsS -X PURGE \
    -H "Authorization: Bearer ${PURGE_TOKEN}" \
    "${VARNISH_URL}/__purge-all" > /dev/null || echo "Varnish purge failed (non-fatal)"
fi

wait $ASTRO_PID
