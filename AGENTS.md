# Repository Guidelines

## Project Overview

This repository contains an ET: Legacy match statistics viewer built with Astro 5 and SolidJS. It fetches match data from the ETL API (`api.etl.lol`) and displays match listings, detailed stats, player comparisons, and awards. The deployment uses a two-tier architecture with Caddy as a reverse proxy/cache and Astro as the application server.

## Project Structure

```
/home/stiba/Repos/etlegacy-stats/
├── astro-server/           # Main Astro 5 application
│   ├── src/
│   │   ├── pages/          # Astro routes (file-based routing)
│   │   │   ├── index.astro              # Match list page
│   │   │   ├── search.astro             # Search functionality
│   │   │   ├── matches/[match]/         # Dynamic match detail pages
│   │   │   └── api/                     # API endpoints
│   │   ├── components/     # SolidJS components (interactive UI)
│   │   ├── layouts/        # Astro layout components
│   │   ├── util/           # Utility functions and API clients
│   │   └── assets/         # Static assets (images, fonts, CSS)
│   │       ├── maps/       # Map images (.avif format)
│   │       ├── weapons/    # Weapon SVG icons
│   │       └── classes/    # Class icons (.avif format)
│   ├── public/             # Public static assets
│   ├── scripts/            # Build/utility scripts
│   └── api-cache/          # Local API cache for development
├── nginx-proxy/            # Nginx reverse proxy
│   ├── Dockerfile          # Proxy container build
│   └── nginx.conf          # Nginx configuration
├── dev/                    # Local development scripts
│   ├── build.sh            # Build both Docker images
│   ├── up.sh               # Start local dev environment
│   └── down.sh             # Stop local dev environment
└── AGENTS.md               # This file
```

## Build, Test, and Development Commands

All application commands run from `astro-server/`:

```bash
cd /home/stiba/Repos/etlegacy-stats/astro-server

# Development
npm run dev              # Start Astro dev server on port 4321

# Building
npm run build            # Create production build in dist/
npm run preview          # Serve production build locally

# Code Quality
npm run typecheck        # Run TypeScript checks without emitting
npm run format           # Format codebase with Prettier
npm run test             # Run Vitest suite

# Utilities
npm run convert-images   # Convert PNG/JPG images to AVIF format
npm ci                   # Install exact dependencies from package-lock.json
```

## Local Development with Docker

Test the full stack locally with the cache proxy:

```bash
cd /home/stiba/Repos/etlegacy-stats/dev

# Build both Docker images
./build.sh

# Start services (proxy on :8080, Astro internal on :4321)
./up.sh

# Test
open http://localhost:8080

# Stop services
./down.sh
```

## Deployment Architecture

The application deploys as two separate services:

1. **Astro Application** (`astro-server/Dockerfile`)
   - Node.js LTS slim base image
   - Builds and runs as standalone server on port 4321
   - Requires `API_TOKEN` environment variable for player Discord name lookups

2. **Nginx Proxy** (`nginx-proxy/Dockerfile`)
   - Simple nginx reverse proxy
   - Proxies all requests to Astro upstream
   - Rewrites `/anal/*` analytics URLs to `app.lythia.dev`
   - Adds immutable cache headers for static assets (js/css/images/fonts)
   - Requires environment variable:
     - `ASTRO_UPSTREAM`: URL to Astro service (e.g., `http://etlegacy-stats-astro:4321`)

## Technology Stack

- **Framework**: Astro 5 with Node.js standalone adapter
- **UI Framework**: SolidJS 1.9 (interactive components)
- **Styling**: Tailwind CSS 3.4 with custom theme
- **UI Components**: Kobalte Core (headless UI primitives)
- **Language**: TypeScript 5.7 (strict mode)
- **Testing**: Vitest 2.1
- **Formatting**: Prettier with prettier-plugin-astro
- **Icons**: solid-icons
- **Fonts**: Nunito Sans (variable), Monaspace Neon (monospace)

## Code Style & Conventions

### Formatting
- Prettier is the source of truth
- 2-space indentation
- Double quotes
- Trailing commas
- Semicolon-free where Prettier allows

### Naming Conventions
- **Components**: PascalCase (`MatchList.tsx`, `MatchListLayout.astro`)
- **Utilities**: camelCase (`formatTime.ts`, `stats-api.ts`)
- **Routes**: Match URL structure (`matches/[match]/index.astro`)
- **Types/Interfaces**: PascalCase with descriptive names

### File Organization
- Astro pages use `.astro` extension
- Solid components use `.tsx` extension
- Utilities are co-located by domain (`stats.ts`, `stats-api.ts`, `awards.tsx`)
- Assets use descriptive names with hyphens (e.g., `iconw_MP40.svg`)

### Component Patterns

**Astro Components** (server-side rendered):
```astro
---
// Frontmatter: server-side JavaScript
import Component from "../components/Component";
const data = await fetchData();
---

<!-- Template -->
<div>{data}</div>
```

**Solid Components** (client-side interactive):
```tsx
import { type Component } from "solid-js";

export type Props = { ... };

export const MyComponent: Component<Props> = (props) => {
  return <div>{props.value}</div>;
};
```

## Data Flow & API

### External API
The app consumes `https://api.etl.lol/api/v2/stats/etl`:

- `fetchGroups()` - List matches with pagination
- `fetchGroupDetails(id)` - Full match data including rounds
- `fetchUsersByGuid()` - Player Discord info (requires auth token)
- `searchGroups()` - Fuzzy search across matches

### Development Caching
In development mode (`import.meta.env.DEV`), API responses are cached to `api-cache/` as JSON files to speed up repeated requests.

### Stats Processing
Match stats are processed in `src/util/stats.ts`:
- Converts raw API data to display-friendly formats
- Calculates aggregates across multiple rounds
- Computes custom ratings based on kill values and respawn times
- Handles team assignments and standin detection

## Environment Variables

### Astro Server (`astro-server/.env`)
```bash
API_TOKEN=          # Bearer token for player Discord name lookups
```

### Deployment (root `.env`)
```bash
ASTRO_UPSTREAM=http://etlegacy-stats-astro:4321
```

## Testing

- **Framework**: Vitest 2.1
- **Current State**: No committed test files (add as needed)
- **Pattern**: Add `*.test.ts` or `*.test.tsx` next to code being tested
- **Priority Areas**:
  - `src/util/stats.ts` - Stats calculation logic
  - `src/util/formatTime.ts` - Time formatting
  - `src/util/sorting.ts` - Sorting algorithms

Run tests before PRs:
```bash
npm run test
npm run typecheck
```

## Tailwind Theme Configuration

Custom theme defined in `tailwind.config.mjs`:

### Colors
- `bush-*`: Warm beige/brown palette (text colors)
- `mud-*`: Dark brown/gray palette (backgrounds)
- `stats-*`: Table row colors (bg, odd, even, hover)

### Custom Grid Templates
- `grid-cols-stats`: Full stats table layout
- `grid-cols-statsSmall`: Compact stats layout
- `grid-cols-weaponStats`: Weapon breakdown table
- `grid-cols-performanceComparison`: Player comparison modal

### Custom Utilities
- `scrollbar-thin`: Thin scrollbar styling

## Asset Guidelines

### Images
- **Maps**: 300px height AVIF format in `src/assets/maps/`
- **Class Icons**: 64px height AVIF format in `src/assets/classes/`
- **Weapon Icons**: SVG format in `src/assets/weapons/`
- Use `npm run convert-images` to convert PNG/JPG to AVIF

### Fonts
- Primary: Nunito Sans Variable (sans-serif)
- Monospace: Monaspace Neon (for stats/numbers)

## Commit & PR Guidelines

- Use short, imperative commit messages (e.g., `Fix weapon stat aggregation`, `Add player comparison modal`)
- Keep commits focused and atomic
- Avoid bundling unrelated infrastructure and app changes
- PRs should include:
  - Brief summary of changes
  - User-visible behavior changes noted
  - Related issue links
  - Screenshots for UI changes
  - Mention of deployment env vars if applicable

## Common Gotchas

1. **API Token Required**: Player Discord names won't load without `API_TOKEN` set
2. **Dev Caching**: Delete `api-cache/` to force fresh API data in development
3. **Round Stats**: Second round stats are calculated as deltas from first round
4. **Team Assignment**: Teams are determined from first round; standins are detected by teammate analysis

6. **Image Format**: Map and class images must be AVIF; weapon icons must be SVG

## Useful Commands Summary

```bash
# Full workflow
cd astro-server
npm ci
npm run typecheck
npm run test
npm run build

# Development with caching
npm run dev
# (Optional) touch api-cache/.gitkeep to persist cache

# Format before commit
npm run format
```
