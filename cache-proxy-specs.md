# Cache Proxy Specifications

## Goal
Implement a reliable ISR (Incremental Static Regeneration) cache layer in front of the Astro application. Long cache times with on-demand invalidation.

## Functional Requirements

### 1. Caching Behavior

#### Match Detail Pages
- **Pattern**: `/matches/{guid}` and `/matches/{guid}?query=params`
- **Cache Duration**: 30 days (720 hours)
- **Storage**: Disk-based for persistence across restarts
- **Cache Key**: Full URL including query parameters (round filters, map filters)

#### Root Page (Match List)
- **Pattern**: `/` (exact, no query params)
- **Cache Duration**: 30 days
- **Storage**: Disk-based
- **Special**: Must be purgeable independently

#### Static Assets
- **Patterns**: `*.css`, `*.js`, `*.woff*`, `*.svg`, `*.avif`, `*.png`, `*.jpg`, etc.
- **Cache Duration**: 1 year (immutable)
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Note**: Filenames are hashed by Astro, so no purge needed

### 2. Purge API

#### Authentication
- Bearer token in `Authorization` header
- OR localhost-only access for security

#### Endpoints

**Purge Match + Root**
```
POST /cache/purge/{match-guid}
Authorization: Bearer {token}
```
- Invalidates the specific match page
- Invalidates the root page (match list contains this match)

**Purge Root Only**
```
POST /cache/purge/root
Authorization: Bearer {token}
```
- Invalidates only the root page

**Response**
```json
{"success": true}
```

### 3. Pass-Through Routes (No Caching)

#### Analytics Rewrites
Must preserve these exact rewrites from original Caddy config:
```
/anal/a/script.js  → https://app.lythia.dev/collect/analytics/script.js
/anal/m/script.js  → https://app.lythia.dev/collect/metrics/script.js
/anal/a            → https://app.lythia.dev/collect/analytics/report
/anal/m            → https://app.lythia.dev/collect/metrics/report
```
Requirements:
- Set `Host: app.lythia.dev` header
- HTTPS to upstream
- No caching

#### Search & API
- `/search*` - No cache (real-time search results)
- `/api/*` - No cache (dynamic API responses)

### 4. Cache Headers

#### Responses from Cache
All cached responses should include:
- `X-Cache-Status: HIT|MISS|BYPASS` for debugging
- Original `Cache-Control` from upstream preserved

#### Responses from Upstream
Match pages return with:
```
Cache-Control: public, s-maxage=2592000, max-age=0, must-revalidate
Surrogate-Key: root match-{guid}
```

### 5. Storage Requirements

- **Type**: Disk-based (survives container restarts)
- **Size**: 1GB max (configurable)
- **Location**: `/var/cache/*` or similar
- **Cleanup**: LRU eviction when size exceeded

### 6. Environment Configuration

Required variables:
```
ASTRO_UPSTREAM      # URL to Astro service (e.g., http://astro:4321)
CACHE_PURGE_TOKEN   # Secret token for purge API
```

### 7. Implementation Notes

#### Option A: Nginx with ngx_cache_purge
- Mature, widely used
- Requires building custom image with module
- Simple key-based purging

#### Option B: Varnish
- Purpose-built for HTTP caching
- VCL configuration
- Excellent purging support

#### Option C: Custom Solution
- Go-based reverse proxy
- Full control over caching logic
- Can optimize for exact use case

### 8. Success Criteria

1. Match pages cache for 30 days
2. Purging a match returns `{"success":true}` and subsequent requests show fresh content
3. Root page can be purged independently
4. Static assets serve with immutable headers
5. Analytics routes work without modification
6. Search/API routes bypass cache entirely
