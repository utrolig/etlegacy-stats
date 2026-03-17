# Local Development

Scripts for local testing with Docker.

## Quick Start

```bash
# Build both images
./build.sh

# Start services
./up.sh

# Test it
open http://localhost:8080

# Stop services
./down.sh
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Cache Proxy | http://localhost:8080 | Main entry point with caching |
| Astro App | http://localhost:4321 (internal) | The actual app |

## Cache

Cached files are stored in `./dev/cache/` directory (mounted as volume).

## Environment

The `up.sh` script sets:
- `ASTRO_UPSTREAM=http://etlegacy-astro:4321`
- `CACHE_PURGE_TOKEN=test-token`
- `API_TOKEN=test-token` (for Astro)

## Test Purge

```bash
# Purge a match
curl -X POST -H "Authorization: Bearer test-token" \
  http://localhost:8080/cache/purge/27463952-bd6a-5232-a152-ea3951625623

# Purge root
curl -X POST -H "Authorization: Bearer test-token" \
  http://localhost:8080/cache/purge/root
```

## Logs

```bash
# View proxy logs
docker logs -f etlegacy-proxy

# View Astro logs
docker logs -f etlegacy-astro
```
