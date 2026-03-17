# ETLegacy stats

```sh
npm i
npm run dev
```

# Deploy

Deploy Astro as its own service using [`Dockerfile`](/home/stiba/Repos/etlegacy-stats/astro-server/Dockerfile).

The reverse proxy is a separate Nginx service built from [`nginx-config/Dockerfile`](/home/stiba/Repos/etlegacy-stats/nginx-config/Dockerfile). Set `ASTRO_UPSTREAM` on that service to the internal Astro URL, for example `http://etlegacy-stats-astro:4321`.
