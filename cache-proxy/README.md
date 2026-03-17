# Cache Proxy

Simple Go reverse proxy with file-based disk caching.

## Features

- **Disk-based caching** - Persists across restarts
- **Simple cache keys** - `root`, `match:{guid}`, `static:{path}`
- **Purge API** - `POST /cache/purge/{guid}` or `/cache/purge/root`
- **Analytics proxy** - Rewrites `/anal/*` to `app.lythia.dev`
- **Static asset caching** - 1 year immutable cache for CSS/JS/images

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ASTRO_UPSTREAM` | `http://localhost:4321` | URL to Astro app |
| `CACHE_PURGE_TOKEN` | (required) | Bearer token for purge API |
| `CACHE_DIR` | `/var/cache/proxy` | Where to store cached files |
| `PORT` | `8080` | Port to listen on |

## Cache Keys

| Route | Cache Key |
|-------|-----------|
| `/` | `root` |
| `/matches/{guid}` | `match:{guid}` |
| `/style.css`, `/app.js`, etc. | `static:{path}` |

## Purge Examples

```bash
# Purge a match (also purges root automatically)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://proxy/cache/purge/27463952-bd6a-5232-a152-ea3951625623

# Purge root only
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://proxy/cache/purge/root
```

## Response Headers

- `X-Cache-Status: HIT|MISS` - Shows if served from cache
- `Cache-Control` - Set appropriately for each content type
