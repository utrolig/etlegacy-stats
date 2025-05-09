#!/bin/bash
set -e

# Create in temp directory where varnish user has permissions
envsubst < ./default.vcl.template > ./default.vcl

# Start Varnish with standard parameters
exec varnishd -F -f /tmp/varnish/default.vcl -a :4322 -s malloc,256m
