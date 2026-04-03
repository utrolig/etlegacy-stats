# ETLegacy stats

```sh
npm i
npm run dev
```

`npm run dev` runs the plain Astro dev server.

## Deploy

Deploy the app as a single service using [`Dockerfile`](/home/stiba/Repos/etlegacy-stats/astro-server/Dockerfile).

The production server is the compiled runtime started by:

```sh
npm run build
npm start
```

## Caching

The production runtime caches rendered HTML on disk for:
- `/`
- `/matches/:matchId`

Static assets under `/_astro/*` are served with long-lived immutable cache headers.

HTML cache behavior:
- `/` is cached for 2 hours by default
- `/matches/:matchId` is cached with a longer TTL
- the on-disk HTML cache is capped at 10 GiB by default
- when the cache exceeds the cap, the server evicts the oldest cached match pages first
- cache metadata is exposed in response headers:
  - `X-Cache`
  - `X-Cache-Hits`
  - `X-Cache-Last-Regenerated`

The cache directory is controlled by `CACHE_DIR`.

Default Docker path:

```text
/var/cache/etlegacy-stats
```

If you want cache persistence across restarts or deploys, mount a persistent volume at `/var/cache/etlegacy-stats`, or set `CACHE_DIR` to another path and mount that instead.

## Environment

Example env file: [`astro-server/.env.example`](/home/stiba/Repos/etlegacy-stats/astro-server/.env.example)

Important variables:
- `API_TOKEN`: bearer token for Discord/player lookups
- `CACHE_PURGE_TOKEN`: bearer token required to purge cached HTML
- `CACHE_DIR`: filesystem path for cached HTML
- `CACHE_MAX_SIZE_BYTES`: max on-disk HTML cache size in bytes (defaults to 10737418240)

## Purging

The server exposes:

```text
DELETE /cache/
DELETE /cache/:matchId
```

Authentication uses:

```text
Authorization: Bearer <CACHE_PURGE_TOKEN>
```

Example `curl`:

```sh
curl -X DELETE \
  -H "Authorization: Bearer ${CACHE_PURGE_TOKEN}" \
  http://localhost:8080/cache/
```

```sh
curl -X DELETE \
  -H "Authorization: Bearer ${CACHE_PURGE_TOKEN}" \
  http://localhost:8080/cache/0f931465-509e-5291-b955-f8d47401f939
```

For local Docker testing, use the helper in [`dev/purge-cache.sh`](/home/stiba/Repos/etlegacy-stats/dev/purge-cache.sh). It can purge `/` or a specific match, and when purging a match it also purges `/`.
