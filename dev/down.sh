#!/bin/sh

echo "=== Stopping services ==="
docker stop etlegacy-proxy 2>/dev/null || true
docker stop etlegacy-astro 2>/dev/null || true

echo "=== Removing network ==="
docker network rm etlegacy-dev 2>/dev/null || true

echo "=== Done ==="
