#!/bin/bash
set -e

# Create in temp directory where varnish user has permissions
envsubst < ./default.vcl.template > ./default.vcl

# Allow cache size tuning from the runtime environment.
: "${VARNISH_CACHE_SIZE:=3g}"

# Start Varnish with standard parameters
exec varnishd -F -f /tmp/varnish/default.vcl -a :80 -s "malloc,${VARNISH_CACHE_SIZE}" -p ban_lurker_age=60
