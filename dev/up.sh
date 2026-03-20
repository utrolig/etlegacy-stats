#!/bin/sh

# Create network if it doesn't exist
docker network inspect etlegacy-dev >/dev/null 2>&1 || docker network create etlegacy-dev

echo "=== Starting Astro app on port 4321 ==="
docker run -d \
  --rm \
  --name etlegacy-astro \
  --network etlegacy-dev \
  -e API_TOKEN=test-token \
  etlegacy-astro:latest

echo "=== Starting nginx proxy on port 8080 ==="
docker run -d \
  --rm \
  --name etlegacy-proxy \
  --network etlegacy-dev \
  -p 8080:8080 \
  -e ASTRO_UPSTREAM=http://etlegacy-astro:4321 \
  etlegacy-proxy:latest

echo ""
echo "=== Services started ==="
echo "App: http://localhost:8080"
echo ""
echo "Run ./down.sh to stop"
