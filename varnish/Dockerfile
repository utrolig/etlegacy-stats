FROM varnish:7.5

USER root
COPY start.sh /usr/local/bin/varnish-start.sh
RUN chmod +x /usr/local/bin/varnish-start.sh
USER varnish

COPY default.vcl /etc/varnish/default.vcl

ENV VARNISH_SIZE=256m

ENTRYPOINT ["/usr/local/bin/varnish-start.sh"]
