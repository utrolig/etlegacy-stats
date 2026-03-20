#!/bin/sh
set -e

echo "=== Building Astro app ==="
cd "$(dirname "$0")/../astro-server"
docker build -t etlegacy-astro:latest .

echo ""
echo "=== Building nginx proxy ==="
cd "$(dirname "$0")/../nginx-proxy"
docker build -t etlegacy-proxy:latest .

echo ""
echo "=== Build complete ==="
echo "Run ./up.sh to start services"
