#!/bin/sh

# Create network if it doesn't exist
docker network inspect etlegacy-dev >/dev/null 2>&1 || docker network create etlegacy-dev

# Create cache directory
mkdir -p "$(dirname "$0")/cache"

echo "=== Starting Astro app on port 4321 ==="
docker run -d \
  --rm \
  --name etlegacy-astro \
  --network etlegacy-dev \
  -e API_TOKEN=test-token \
  etlegacy-astro:latest

echo "=== Starting cache proxy on port 8080 ==="
docker run -d \
  --rm \
  --name etlegacy-proxy \
  --network etlegacy-dev \
  -p 8080:8080 \
  -v "$(dirname "$0")/cache:/var/cache/proxy" \
  -e ASTRO_UPSTREAM=http://etlegacy-astro:4321 \
  -e CACHE_PURGE_TOKEN=test-token \
  -e CACHE_DIR=/var/cache/proxy \
  -e PORT=8080 \
  etlegacy-proxy:latest

echo ""
echo "=== Services started ==="
echo "App: http://localhost:8080"
echo "Purge: curl -X POST -H 'Authorization: Bearer test-token' http://localhost:8080/cache/purge/<guid>"
echo ""
echo "Run ./down.sh to stop"
