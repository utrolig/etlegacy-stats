#!/bin/sh

echo "=== Stopping services ==="
docker stop etlegacy-varnish 2>/dev/null || true
docker stop etlegacy-astro 2>/dev/null || true
docker network rm etlegacy-net 2>/dev/null || true

echo "=== Done ==="
