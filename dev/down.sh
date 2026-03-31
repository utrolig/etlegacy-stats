#!/bin/sh

echo "=== Stopping services ==="
docker stop etlegacy-astro 2>/dev/null || true

echo "=== Done ==="
