FROM varnish:7.5

COPY default.vcl /etc/varnish/default.vcl

# 256MB in-memory cache. Adjust via VARNISH_SIZE env var in Coolify if needed.
ENV VARNISH_SIZE=256m
