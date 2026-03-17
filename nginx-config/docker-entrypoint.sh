#!/bin/sh
set -eu

# Replace environment variables in nginx config
envsubst '${ASTRO_UPSTREAM} ${CACHE_PURGE_TOKEN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Create cache directory
mkdir -p /var/cache/nginx/match_cache
chown -R nginx:nginx /var/cache/nginx

exec "$@"
