FROM varnish:latest

USER root

RUN apt update && apt-get install -y gettext-base

# Create a directory with proper permissions
RUN mkdir -p /tmp/varnish && chown -R varnish:varnish /tmp/varnish

WORKDIR /tmp/varnish

COPY --chmod=755 entrypoint.sh ./entrypoint.sh
COPY --chmod=755 default.vcl.template ./default.vcl.template

# Give appropriate ownership
RUN chown -R varnish:varnish /tmp/varnish

USER varnish

ENTRYPOINT ["./entrypoint.sh"]
