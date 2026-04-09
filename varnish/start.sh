#!/bin/sh
set -eu

VCL=/etc/varnish/default.vcl
WORKDIR=/var/lib/varnish

# Start varnishd in background so we can also run the reload watcher
varnishd \
    -F \
    -f "$VCL" \
    -s "malloc,${VARNISH_SIZE:-256m}" \
    -a "0.0.0.0:${VARNISH_HTTP_PORT:-80},HTTP" \
    -n "$WORKDIR" &

VARNISH_PID=$!
trap 'kill $VARNISH_PID 2>/dev/null' TERM INT

# Wait for varnishd to be ready
until varnishadm -n "$WORKDIR" status 2>/dev/null | grep -q "running"; do
    sleep 1
done
echo "Varnish ready."

# When the backend goes sick, Varnish has the stale IP cached from startup.
# Reloading the VCL forces a fresh DNS resolution, picking up the new container IP.
VCL_VER=0
while kill -0 $VARNISH_PID 2>/dev/null; do
    sleep 3
    if varnishadm -n "$WORKDIR" backend.list 2>/dev/null | grep -q "Sick"; then
        PREV_VER=$VCL_VER
        VCL_VER=$((VCL_VER + 1))
        if varnishadm -n "$WORKDIR" vcl.load "reload_${VCL_VER}" "$VCL" 2>/dev/null \
        && varnishadm -n "$WORKDIR" vcl.use "reload_${VCL_VER}" 2>/dev/null; then
            echo "VCL reloaded (reload_${VCL_VER}) — re-resolving backend DNS"
            [ "$PREV_VER" -gt 0 ] && \
                varnishadm -n "$WORKDIR" vcl.discard "reload_${PREV_VER}" 2>/dev/null || true
        fi
    fi
done

wait $VARNISH_PID
