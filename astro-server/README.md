# ETLegacy stats

```sh
npm i
npm run dev
```

# Deploy

Deploy Astro as its own service using [`Dockerfile`](/home/stiba/Repos/etlegacy-stats/astro-server/Dockerfile).

The reverse proxy/cache is a separate Caddy service built from [`caddy-config/Dockerfile`](/home/stiba/Repos/etlegacy-stats/caddy-config/Dockerfile). Set `ASTRO_UPSTREAM` on that service to the internal Astro URL, for example `http://etlegacy-stats-astro:4321`, and set `CACHE_PURGE_TOKEN` for the purge API.
