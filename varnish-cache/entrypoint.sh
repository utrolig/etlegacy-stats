#!/bin/bash
set -e

# Create in temp directory where varnish user has permissions
envsubst < ./default.vcl.template > ./default.vcl

# Start Varnish with standard parameters
exec varnishd -F -f /tmp/varnish/default.vcl -a :80 -s malloc,256m -p ban_lurker_age=60
