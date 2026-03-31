#!/bin/sh

# Create network if it doesn't exist
docker network inspect etlegacy-dev >/dev/null 2>&1 || docker network create etlegacy-dev

echo "=== Starting Astro app on port 4321 ==="
docker run -d \
  --rm \
  --name etlegacy-astro \
  --network etlegacy-dev \
  -p 8080:4321 \
  -e API_TOKEN=test-token \
  -e CACHE_PURGE_TOKEN=dev-cache-token \
  -v etlegacy-astro-cache:/var/cache/etlegacy-stats \
  etlegacy-astro:latest

echo ""
echo "=== Services started ==="
echo "App: http://localhost:8080"
echo ""
echo "Run ./down.sh to stop"
