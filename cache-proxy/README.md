# Cache Proxy

Simple Go reverse proxy with file-based disk caching.

## Features

- **Disk-based caching** - Persists across restarts (HTML pages only)
- **Simple cache keys** - `root`, `match:{guid}`
- **Purge API** - `POST /cache/purge/{guid}` or `/cache/purge/root`
- **Analytics proxy** - Rewrites `/anal/*` to `app.lythia.dev`
- **Static assets** - Pass through with `immutable` cache headers (not cached in proxy)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ASTRO_UPSTREAM` | `http://localhost:4321` | URL to Astro app |
| `CACHE_PURGE_TOKEN` | (required) | Bearer token for purge API |
| `CACHE_DIR` | `/var/cache/proxy` | Where to store cached files |
| `PORT` | `8080` | Port to listen on |

## Cache Keys

| Route | Cache Key | Cached? |
|-------|-----------|---------|
| `/` | `root` | Yes |
| `/matches/{guid}` | `match:{guid}` | Yes |
| Static assets (CSS, JS, images) | - | No (cache headers added) |
| `/search/*`, `/api/*` | - | No |

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

- `X-Cache-Status: HIT|MISS` - Shows if served from proxy cache (HTML only)
- `Cache-Control: public, s-maxage=2592000, max-age=0, must-revalidate` - HTML pages
- `Cache-Control: public, max-age=31536000, immutable` - Static assets
