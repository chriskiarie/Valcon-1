# Build notes — Concept B "Nightfall" (Concept A "Daylight" built in parallel)

## Concept & Rules
- This repository is **Concept B "Nightfall"** — same content contract as Concept A "Daylight", clearly different look and feel.
- Never call this build v2 or v3.
- Static export stays (`next.config.ts`: `output: "export"`, `images.unoptimized: true`).
- No new dependencies beyond what is installed (GSAP already present). No external requests, analytics, or icon libraries.
- Components read content only through `lib/content.ts`. Do not change the shape of `site.json`, `aircraft.json` or `services.json` without telling the client first.

## Done

### Phase 0 — Safety & Verification
- `git tag v2-baseline`, then `git checkout -b concept-b-nightfall`
- Node v22.22.0, npm 10.9.4, next 16.4.5, react 19.3.0, gsap 3.15.1
- Preview command: `npx serve out --listen 127.0.0.1:4173` (or `python -m http.server 4173 --directory out --bind 127.0.0.1`)
- Review via `npm run build` then `npm run preview` (never `next start` — not a static export)

### Phase 1A — Accuracy Cleanup
- `site.json`: tagline → "Regional aviation reimagined"; phone/WhatsApp/email → empty (rendered only when real values exist)
- `aircraft.json`: only 5Y-VAL (Bombardier CRJ200 LR) is "In fleet"; Gulfstream G650 and Embraer Phenom 300 renamed "Sample Aircraft A/B", status "Sample", no registrations
- All invented specs (seats/range/cruiseSpeed) and features removed; spec fields kept but null
- Descriptions neutralized: "Regional travel from Wilson Airport.", "Considered, quiet and dependable." (removed business-model claims)
- Header: fake phone removed; Contact button only; WhatsApp/Email render only when real values exist
- Footer: "Demo draft" removed; concept pill → "Concept B · Nightfall"; WhatsApp/Email conditional
- Hero lede: removed "built around the CRJ200 LR"
- Fleet heading: single H2 with chapter label "02 Fleet" above (no duplicate "The fleet")
- Status pill: nowrap, pill-shaped, on its own row
- `services.json`: draft titles "Charter flights", "Corporate and group travel", "Fleet and operations"
- Build passes; typecheck passes; lint passes (0 errors)

### Phase 1B — Concept B Identity ("Nightfall")
- `styles/tokens.css`: Nightfall palette — bg #060b14, surface #0c1523, surface-raised #121e31, ink #eaf0f7, ink-muted #9aa8ba, line rgba(234,240,247,0.12), brand #0e2a47, accent #6ea8ff, cabin #ffe9c7 (tiny cabin-window glows only)
- Fonts: Fraunces (display, 300/400) + DM Sans (body, 400/500/700) via next/font
- Wordmark VALCON AIR: DM Sans 700, uppercase, letter-spacing 0.24em, ~28–32px desktop / 22–24px mobile
- Header: crisp 1px line, faint shadow only after scrolling, no backdrop blur
- Hero: darker, `background: var(--color-bg)`, cursor-reactive radial light (desktop only, off on touch/reduced motion), cursor lerp ~0.08
- Layout: full-bleed sections, hairline rules, oversized headlines, asymmetric 12-column grid, chapter labels (01 Operator, 02 Fleet, 03 Services, 04 Enquiries)
- Radius only on images and modals (~12px)
- Section padding: `clamp(3rem, 6vw, 5rem)` (tighter)
- Page title: "Valcon Air | Concept B · Nightfall"
- Color scheme: dark, themeColor from `--color-bg`
- Motion: durations ~1.25x slower, power3.out easing, line-by-line clip reveals, directional entrances

### Phase 2 — Flyby System (highest priority; replaces SVG MotionPath)
- `lib/flyby/planes.ts`: pool of 4 aircraft images (level, climbing ~8°, descending ~5°, banked ~6°) with metadata (anchors, base angle, scales, credit key)
- `lib/flyby/path.ts`: cubic bezier path generator with `pathPositionAt(t)` returning {x, y, angle}
- `lib/flyby/contrail.ts`: ContrailRenderer — procedural sprite generator (4 variants × 2 tints), particle pool (140 desktop / 60 mobile), sub-step emission (≤5px spacing), dual-pass shading, tapered ribbon core, adaptive quality (halves budget if frame >24ms)
- `lib/flyby/director.ts`: FlybyDirector — 3 triggers (hero-load @400ms, fleet-transition @30% in-view, final-approach @25% in-view), 6s cooldown, lane avoidance, one-plane-at-a-time, tab/modal visibility handling
- `components/flyby/FlybyLayer.tsx`: fixed full-viewport overlay (z-index 55), canvas trail + plane image + 3 nav-light dots (red wing, white tail strobe, green wing), rim glow `drop-shadow(0 0 18px rgba(110,168,255,0.35))`
- `public/images/flyby/plane-{level,climbing,descending,banked}.svg`: 4 SVG cutout placeholders
- `layout.tsx`: `<FlybyLayer />` mounted once in root layout, above `<main>`
- `FleetTeaser.tsx` / `ClosingCta.tsx`: registered trigger elements with director
- Reduced-motion: no flybys, no trail, no nav-light animation
- Three flybys: hero-load (L→R, upper band), fleet-transition (R→L, mid height), final-approach (L→R, descending curve, scales to 0.55 & fades over last 15%)
- Build passes; typecheck passes; lint passes (0 errors)

### Phase 3a — Second-Screen Parallax (Section 25)
- `components/parallax/ParallaxLayer.tsx`: night cloud-top/wing parallax layer, deep navy duotone gradient (#0e2a47 → #1a2e4a → #0e2a47), fractal noise texture, line-art overlay (white at 22%)
- Image layer: ±12% desktop / ±6% mobile parallax; overlay counter-moves and rotates 0–25° (desktop)
- Static with reduced motion; mobile range halved
- `HomeIntro.tsx`: intro heading sets in ~4 balanced lines (mobile: 5 at most) with `text-wrap: balance`, no orphan word

### Phase 3b — Site-Wide Geometry Layer (Section 26)
- `components/geometry/GeometryLayer.tsx`: star-map network of 14–20 nodes (18 desktop / 14 mobile) joined by hairlines (white at 7%)
- Scroll parallax depth factors 0.1–0.4 per node
- Nodes brighten near cursor (desktop, up to +0.04 opacity)
- Rendered in gutters/empty areas only; static with reduced motion
- `layout.tsx`: `<GeometryLayer />` after FlybyLayer, before `<main>`

### Phase 3c — Fleet Cards + Modal (Sections 27 & 35.6)
- `FleetRow.tsx`: night cabin window cards — dark glass frame, faint warm cabin glow (#ffe9c7 at 6%) on hover, reveal animation on scroll enter (IntersectionObserver 0.15 threshold)
- Clickable cards open modal; consistent color grade (cool, desaturated, saturate 0.85)
- `FleetModal.tsx`: dark glass panel — desktop: two-column layout (16:9 image + thumbnails left, info panel right); mobile: bottom sheet ~90svh with drag handle, swipe down to close, actions pinned
- Previous/next aircraft buttons, keyboard arrows (ArrowLeft/ArrowRight), hash deep link (#slug)
- Disclaimer: "Illustrative images. Client aircraft photography to follow." in section and modal
- Full focus trap; background inert (aria-hidden) while modal open; focus restored on close
- Build passes; typecheck passes; lint passes (0 errors)

## Not Done / Pending

- Cloudflare Pages deployment and repository hosting require account access. No remote is configured and no authenticated `gh`/`wrangler` session is present, so no live URL exists yet and the live noindex headers are unverified.
- **3d New arrival (Section 28)**: boarding-pass departure-board motif with split-flap rows: registration 5Y-VAL, Bombardier CRJ200 LR, origin Calgary, destination Wilson Airport, status Delivered. Characters flip once as band scrolls into view. No times, dates, or other claims. Stacked rows on mobile. Eyebrow contrast ≥4.5:1.
- **3e Services (Section 29 draft titles)**: Charter flights, Corporate and group travel, Fleet and operations — tone-only copy, no business-model claims.
- **3f Scroll choreography (Section 30)**: headings alternate left/right; card rows enter left/pop/right; paragraphs from below; line-by-line clip reveals for display headings; once only; overflow-x clip on main wrapper.
- **3g Tighter spacing + final screen (Section 31)**: section padding `clamp(3rem, 6vw, 5rem)` (done); request band + compact footer fit one 100svh screen at end of scroll; footer ~200px tall; image credits move to `/credits/` page linked from footer and each modal.
- **3h Edge refinements (35.7)**: taller fleet sheet, action bar labels 12–13px with icons ~22px, mobile hero crop with set focal point and stronger bottom gradient, designed focus rings, header crisp 1px line + faint shadow only after scrolling.
- **3i Mobile fixes (35.9)**: mobile hero crop focal point, stronger bottom gradient.

## Verification

Checked on 10 November 2026 in Chrome (headless for automated checks) with portable Node 24.22.2.

- `npm run build`: passes; `/`, `/fleet/` and `/contact/` prerendered as static content to `out/`
- `npm run lint`: passes (0 errors; 21 pre-existing warnings only)
- `npm run typecheck`: passes (0 errors)
- Routes `/`, `/fleet/`, `/contact/`: all return 200 from static `out/` preview
- No horizontal scroll 320–1920px; 0 CLS across all runs
- Lighthouse mobile: 96, 94, 91 (all ≥90). SEO 66 expected (noindex).
- Reduced-motion: no flybys, no trail, no nav-light animation, static geometry
- Copy audit: no `[placeholder]` markers remain in any component
- GSAP only on home route + flyby client components

## Remaining Phases (3d–3i)

- 3d: New arrival boarding-pass band
- 3e: Services strip tone-only copy
- 3f: Directional scroll choreography
- 3g: Tighter spacing + final screen + credits page
- 3h: Edge refinements (focus rings, mobile hero crop, header line)
- 3i: Mobile fixes

## Image Assets

### Hero photos
- `site/public/images/hero/hero-desktop.{avif,webp,jpg}` — 1920×1080, each ~11–31 KB
- `site/public/images/hero/hero-mobile.{avif,webp,jpg}` — 900×1400, each ~8–22 KB
- Source: Jongsun Lee / Wikimedia Commons, CC BY 3.0

### Fleet aircraft images
- Hero images from `aircraft.json` `hero.desktop` / `hero.mobile` (SVG placeholders until client photography)
- Gallery images per aircraft (cabin/interior views)

### Flyby plane images
- `site/public/images/flyby/plane-{level,climbing,descending,banked}.svg` — 4 SVG cutout placeholders

### Plane silhouette
- `site/public/svg/plane.svg` — 778 bytes, viewBox 0 0 120 40

### Logo
- `site/public/svg/logo-placeholder.svg` — replace with client logo

## Next Steps for Client

1. Supply original photography to replace Wikimedia Commons hero images
2. Provide client logo to replace `logo-placeholder.svg`
3. Add real aircraft hero images to `aircraft.json` `hero` fields
4. Add gallery images to `aircraft.json` `gallery` array
5. Confirm copy (legal name, Wilson Airport base, CRJ200 LR 5Y-VAL, "Recently delivered to Wilson Airport, Nairobi")

## Phase 3d–3i Remaining

New arrival band, services strip, directional scroll choreography, tighter spacing/final screen, edge refinements, mobile fixes.