#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
ASTRO_ENV_FILE="${SCRIPT_DIR}/../astro-server/.env"

if [ -f "${ASTRO_ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  . "${ASTRO_ENV_FILE}"
fi

API_TOKEN="${API_TOKEN:-test-token}"
CACHE_PURGE_TOKEN="${CACHE_PURGE_TOKEN:-dev-cache-token}"

echo "=== Starting Astro app on port 4321 ==="
docker run -d \
  --rm \
  --name etlegacy-astro \
  -p 8080:4321 \
  -e API_TOKEN="${API_TOKEN}" \
  -e CACHE_PURGE_TOKEN="${CACHE_PURGE_TOKEN}" \
  -v etlegacy-astro-cache:/var/cache/etlegacy-stats \
  etlegacy-astro:latest

echo ""
echo "=== Services started ==="
echo "App: http://localhost:8080"
echo ""
echo "Run ./down.sh to stop"
