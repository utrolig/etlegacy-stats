FROM varnish:7.6

USER root
RUN apt-get update -y && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
USER varnish

COPY default.vcl /etc/varnish/default.vcl

# 256MB in-memory cache. Adjust via VARNISH_SIZE env var in Coolify if needed.
ENV VARNISH_SIZE=256m
