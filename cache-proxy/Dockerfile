FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download 2>/dev/null || true

COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o cache-proxy main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/cache-proxy .

# Create cache directory
RUN mkdir -p /var/cache/proxy

EXPOSE 8080

ENV PORT=8080
ENV CACHE_DIR=/var/cache/proxy

ENTRYPOINT ["./cache-proxy"]
