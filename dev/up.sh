#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
ASTRO_ENV_FILE="${SCRIPT_DIR}/../astro-server/.env"

if [ -f "${ASTRO_ENV_FILE}" ]; then
  # shellcheck disable=SC1090
  . "${ASTRO_ENV_FILE}"
fi

API_TOKEN="${API_TOKEN:-test-token}"
PURGE_TOKEN="${PURGE_TOKEN:-dev-purge-token}"

# Shared network so Varnish can reach Astro by container name
docker network create etlegacy-net 2>/dev/null || true

echo "=== Starting Astro app ==="
docker run -d \
  --rm \
  --name etlegacy-astro \
  --network etlegacy-net \
  -e API_TOKEN="${API_TOKEN}" \
  -e VARNISH_URL="http://etlegacy-varnish" \
  -e PURGE_TOKEN="${PURGE_TOKEN}" \
  etlegacy-astro:latest

echo "=== Starting Varnish on port 8080 ==="
docker run -d \
  --rm \
  --name etlegacy-varnish \
  --network etlegacy-net \
  -p 8080:80 \
  --cap-add IPC_LOCK \
  -e PURGE_TOKEN="${PURGE_TOKEN}" \
  etlegacy-varnish:latest

echo ""
echo "=== Services started ==="
echo "App (via Varnish): http://localhost:8080"
echo ""
echo "Run ./down.sh to stop"
