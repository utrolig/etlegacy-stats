# Repository Guidelines

## Project Structure & Module Organization
This repository is centered on [`astro-server/`](/home/stiba/Repos/etlegacy-stats/astro-server), an Astro 5 application for ET: Legacy match stats. Main UI routes live in `src/pages/`, reusable UI is in `src/components/`, layouts are in `src/layouts/`, and domain helpers are in `src/util/`. Static assets such as map images, icons, and fonts live under `src/assets/` and `public/`. Supporting infrastructure is kept at the repo root: [`docker-compose.yml`](/home/stiba/Repos/etlegacy-stats/docker-compose.yml), [`varnish-cache/`](/home/stiba/Repos/etlegacy-stats/varnish-cache), and [`nginx-config/`](/home/stiba/Repos/etlegacy-stats/nginx-config).

## Build, Test, and Development Commands
Run app commands from `astro-server/`:

- `npm ci`: install exact dependencies from `package-lock.json`.
- `npm run dev`: start the Astro dev server on port `4321`.
- `npm run build`: create the production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run typecheck`: run TypeScript checks without emitting files.
- `npm run test`: run the Vitest suite.
- `npm run format`: format the codebase with Prettier.
- `npm run convert-images`: run the image conversion helper in `scripts/convertImages.ts`.

Use `docker compose up --build` from the repo root when you need the full Astro + Varnish + Nginx stack.

## Coding Style & Naming Conventions
Use Prettier as the source of truth; this repo uses `prettier-plugin-astro`. The existing codebase uses 2-space indentation, double quotes, trailing commas, and semicolon-free style only where Prettier applies it naturally. Name Solid and Astro components in `PascalCase` (`MatchList.tsx`), utilities in `camelCase` (`formatTime.ts`), and keep route filenames aligned with URL structure such as `src/pages/matches/[match]/index.astro`.

## Testing Guidelines
Vitest is configured via the app dependencies, but committed test files are currently minimal or absent. Add tests next to the code they cover or under `src/` using `*.test.ts` or `*.test.tsx`. Prioritize coverage for parsing, formatting, and stats logic in `src/util/`. Run `npm run test` before opening a PR and pair nontrivial changes with `npm run typecheck`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit messages such as `Remove repeat`, `Make stats work for single round entries`, and `tooltip`. Keep commits focused and descriptive; avoid bundling unrelated infra and app changes together. PRs should include a brief summary, note any user-visible behavior changes, link related issues when applicable, and attach screenshots for UI changes. If Docker or cache behavior changes, mention required environment variables such as `VARNISH_PURGE_TOKEN`.
