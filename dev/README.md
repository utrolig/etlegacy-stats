# Local Development

Scripts for local testing with Docker.

## Quick Start

```bash
# Build the app image
./build.sh

# Start the app
./up.sh

# Test it
open http://localhost:8080

# Stop services
./down.sh
```

## Service

| Service | URL | Description |
|---------|-----|-------------|
| Astro App | http://localhost:8080 | App server with HTML cache, static asset handling, and analytics rewrites |

## Environment

The `up.sh` script sets:
- `API_TOKEN=test-token` (for Astro)
- `CACHE_PURGE_TOKEN=dev-cache-token`

## Logs

```bash
# View app logs
docker logs -f etlegacy-astro
```
