FROM golang:1.24-alpine AS helper-builder

WORKDIR /src
COPY purge-helper.go ./
ARG TARGETOS
ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o /out/purge-helper ./purge-helper.go

FROM caddy:2.11-builder-alpine AS caddy-builder

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    xcaddy build \
      --with github.com/darkweak/souin/plugins/caddy \
      --with github.com/darkweak/storages/badger/caddy

FROM caddy:2.11-alpine

COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
COPY --from=helper-builder /out/purge-helper /usr/local/bin/purge-helper
COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
