# Valcon Air — website demo

Static, mobile-first demo site for Valcon Air Solutions Limited, based at Wilson Airport, Nairobi. This repository currently contains steps 1 and 2 of the build: project setup, deployment configuration, design tokens, content files and the site shell.

All unconfirmed copy is marked `[placeholder]`. Do not treat placeholder contact details, copy or aircraft specifications as real.

## Stack

- Next.js App Router with TypeScript, Tailwind CSS 4 and ESLint
- Static export (`output: "export"`) to `site/out`
- Fonts self-hosted at build time through `next/font`
- Content held in local JSON and read through `site/lib/content.ts`
- No GSAP yet

## Requirements

- Node 24 LTS (the current LTS at build time was 24.22.2)
- npm 11+

## Local development

```bash
cd site
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
cd site
npm run build
npm run lint
npm run typecheck
```

The static site is written to `site/out`.

## Cloudflare Pages

- Repository root directory: `site`
- Build command: `npm run build`
- Build output directory: `out`
- Environment variable: `NODE_VERSION=24`

`public/_headers` and `public/robots.txt` are copied into the exported site. They keep the demo out of search results together with the page metadata.

## Structure

- `assets-source/` — originals and internal references, never deployed
- `docs/` — notes, asset log, decisions and reference teardown
- `site/` — the deployable Next.js app
