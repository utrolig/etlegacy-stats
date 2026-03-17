# Nginx Cache Configuration

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ASTRO_UPSTREAM` | Upstream Astro server | `etlegacy-stats-astro:4321` |
| `CACHE_PURGE_TOKEN` | Bearer token for purge API | `your-secret-token` |

## Cache Behavior

### Match Pages (`/matches/{guid}`)
- Cached for 30 days on disk
- Can be purged via `POST /cache/purge/{guid}`

### Root Page (`/`)
- Cached for 30 days on disk
- Can be purged via `POST /cache/purge/root`
- Auto-purged when any match is purged

### Static Assets (CSS, JS, fonts, images)
- Cached for 1 year with `immutable` directive
- No purge needed (hashed filenames)

### Analytics Routes
- Pass-through to `app.lythia.dev`
- No caching

### Search/API
- No caching (real-time results)

## Purge API

### Purge a specific match
```bash
curl -X POST \
  -H "Authorization: Bearer ${CACHE_PURGE_TOKEN}" \
  http://your-domain/cache/purge/9c8e8ca2-c006-529a-a6b0-62013fc1f637
```

### Purge root page only
```bash
curl -X POST \
  -H "Authorization: Bearer ${CACHE_PURGE_TOKEN}" \
  http://your-domain/cache/purge/root
```

## Cache Status Header

Responses include `X-Cache-Status`:
- `HIT` - Served from cache
- `MISS` - Fetched from upstream, cached
- `BYPASS` - Not cached (purge endpoint, search, etc.)
- `EXPIRED` - Cache expired, fetched fresh

## Deployment

Build and run:
```bash
docker build -t etlegacy-nginx .
docker run -p 80:80 \
  -e ASTRO_UPSTREAM=astro:4321 \
  -e CACHE_PURGE_TOKEN=secret \
  etlegacy-nginx
```
