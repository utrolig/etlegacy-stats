#!/bin/sh
set -e

echo "=== Building Astro app ==="
cd "$(dirname "$0")/../astro-server"
docker build -t etlegacy-astro:latest .

echo ""
echo "=== Building cache proxy ==="
cd "$(dirname "$0")/../cache-proxy"
docker build -t etlegacy-proxy:latest .

echo ""
echo "=== Build complete ==="
echo "Run ./up.sh to start services"
