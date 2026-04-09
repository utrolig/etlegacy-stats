FROM varnish:7.5

USER root
RUN apt-get update && apt-get install -y libvmod-dynamic && rm -rf /var/lib/apt/lists/*
USER varnish

COPY default.vcl /etc/varnish/default.vcl

# 256MB in-memory cache. Adjust via VARNISH_SIZE env var in Coolify if needed.
ENV VARNISH_SIZE=256m
