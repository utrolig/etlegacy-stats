#!/bin/sh
set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"

echo "=== Building Astro app ==="
docker build -t etlegacy-astro:latest "${SCRIPT_DIR}/../astro-server"

echo ""
echo "=== Building Varnish ==="
docker build -t etlegacy-varnish:latest "${SCRIPT_DIR}/../varnish"

echo ""
echo "=== Build complete ==="
echo "Run ./up.sh to start services"
