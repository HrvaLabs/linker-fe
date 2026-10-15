# Ladica

Dead-simple link saver — **spremi linkove, otvori jednim dodirom**. Croatian,
mobile-first, local-first PWA. A [HrvaLabs](https://hrvalabs.net/) project,
deployed at [ladica.hrva.cc](https://ladica.hrva.cc).

Source repository: [HrvaLabs/linker-fe](https://github.com/HrvaLabs/linker-fe).

Signed out, links live only in the browser (`localStorage`) — no accounts, no
analytics, no external scripts, nothing leaves the device. Sign-in is optional:
it turns on cross-device sync against the Ladica Sync backend (see
[optional sync](#optional-sync)).

## Stack

- **Astro** (static output) — launcher (`/`) and landing (`/landing`) are plain HTML for SEO.
- **Svelte island** — the app (`/app`) is an interactive component (`client:only`).
- **@vite-pwa/astro** (Workbox) — installable, offline-capable PWA.

> **On versions:** This is intentionally on Astro 4 + Svelte 4. `@astrojs/sitemap` is
> pinned to `3.2.1` — the last release compatible with Astro 4 (newer 3.7.x requires an
> Astro 5+ build hook). Astro 7 isn't an option yet because `@vite-pwa/astro` supports
> Astro ≤5. The Svelte advisories flagged by `npm audit` are **SSR-only** XSS issues;
> this app never server-renders Svelte (the island is `client:only`), so they don't
> apply to the shipped site. Revisit when `@vite-pwa/astro` gains Astro 7 support or when
> server sync is added.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # Vitest (logic + components)
```

## Build

```bash
npm run build      # → dist/  (static)
npm run preview    # serve the production build locally
```

The PWA service worker is only active in the production build (`build` + `preview`),
not in `dev`.

## Optional sync

The app is local-first and works fully signed-out. Signing in (Google or e-mail
magic-link) is opt-in and turns on cross-device sync against the **Ladica Sync
backend** ([HrvaLabs/linker-be](https://github.com/HrvaLabs/linker-be)). Without a reachable backend, sync simply
stays idle — the local experience is unchanged.

The backend base URL comes from `PUBLIC_API_BASE` (an Astro `PUBLIC_*` env, so it
is read at build time and exposed to the client). Copy `.env.example` to `.env`
and adjust it, or pass it inline. `.env` files are git-ignored.

```bash
# Default — production backend
PUBLIC_API_BASE=https://ladica-api.hrva.cc

# Run the dev server against a local backend instead
PUBLIC_API_BASE=http://localhost:8080 npm run dev
```

Using sync requires the [Ladica Sync backend](https://github.com/HrvaLabs/linker-be) to be deployed (or running locally at
`http://localhost:8080`). See `docs/superpowers/plans/2026-06-26-ladica-sync-backend.md`.

## Icons

PWA icons are generated from `src/assets-src/*.svg`:

```bash
npm run gen:icons  # writes public/assets/icon-{192,512,512-maskable}.png
```

## Deploy — Cloudflare Workers

This repository is connected to the existing Cloudflare Worker `linker-fe`
through **Workers Builds** (GitHub organization `HrvaLabs`, branch `main`).

- **Build command:** `npm run build` (Astro static output in `dist/`).
- **Deploy command:** `npx wrangler deploy`.
- **Production Worker:** `linker-fe`.
- **Custom domain:** `ladica.hrva.cc` (attached directly to the Worker).

Pushes to `main` trigger automated builds and production deployments.
The Cloudflare Worker and custom domain are managed independently from the
GitHub repository owner, so no replacement Worker or DNS change is needed.

Cloudflare's build integration must have access to the `HrvaLabs` GitHub
organization and this repository. Cache headers for the service worker,
manifest, and static assets live in `public/_headers`.

## Project layout

```
src/
  layouts/Base.astro            # shared <head>: SEO, OG, JSON-LD, PWA meta
  components/
    BrandMark.astro
    app/                        # the Svelte island
      LinkApp.svelte            # root; FilterBar / LinkCard / AddSheet / Snackbar / QrDialog / InstallButton
      lib/                      # url, categories, storage (sync seam), store, io (import/export)
  pages/  index.astro  landing.astro  app.astro
  styles/tokens.css             # design tokens (single source of truth)
public/                         # icons, robots.txt, _headers, favicon, og
docs/design-export/             # the original Open Design export (reference)
docs/superpowers/               # spec + implementation plan
```

## Server sync

Storage is behind a small adapter interface (`src/components/app/lib/storage.ts`),
which keeps the on-device working copy local-first. On top of it, optional cloud
sync is implemented in `src/components/app/lib/{auth,api,sync}.ts`: it reconciles
localStorage with the Ladica Sync backend (last-write-wins on `updatedAt`, with
soft-delete tombstones). See [optional sync](#optional-sync)
to point it at a backend.
