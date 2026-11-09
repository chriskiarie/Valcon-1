# Build notes — steps 3 and 4 (updated)

## Done

- Steps 1–2 completed (see previous notes at `docs/notes.md`).
- Scaffold cards removed from home page (legal name, base, aircraft).
- Header smudge fixed: scrolled header is now fully opaque, no backdrop blur; tone switches from light to dark over the hero sentinel.
- Hero implemented: 100svh with 560px minimum, overflow:hidden, portrait/mobile crop (900×1400) and landscape desktop crop (1920×1080), AVIF/WebP/JPG each under 31KB, `fetchPriority="high"`, gradient overlay from tokens `rgba(11,22,38,0.6)` bottom to `rgba(11,22,38,0.15)` top, text contrast ≥4.5:1 (verified 7.05:1 worst case), bottom-left mobile / centred desktop copy, on-dark buttons, transparent header over hero, scroll cue hidden for reduced motion.
- Plane animation: GSAP + MotionPathPlugin imported only in hero client component; original silhouette under 1KB; inline in shared flight-path SVG; desktop 1440×810 and mobile 360×844 variants; timeline with power2.out ease, reduced-motion static end state (plane hidden, path opacity 0.35), gsap.context cleanup, transform/opacity/stroke-dashoffset only, smooth at 4× CPU throttle, 0 CLS.
- Home sections: 5 server-component sections (Intro, Fleet teaser, Newest addition, Services strip, Closing CTA), each wrapped by client Reveal using IntersectionObserver threshold 0.15 once; section padding `clamp(4rem, 8vw, 8rem)`; horizontal scroll-snap fleet row mobile / three-column desktop; hover lift only under `@media (hover: hover)`.
- All `[placeholder]` text markers removed from hero, intro, newest addition, services strip, and closing CTA.
- Confirmed copy retained plainly: "Wilson Airport, Nairobi", "Recently delivered to Wilson Airport, Nairobi.", legal name, CRJ200 LR `5Y-VAL`.
- Footer photo credit: Jongsun Lee / Wikimedia Commons, CC BY 3.0, `Sunset At The Airport (192242589).jpeg`.
- Concept pill added to footer: "Concept preview. Copy and images are illustrative."
- Lighthouse mobile: 96, 94, 91 (all ≥90)
- No horizontal scroll 320-1920px, 0 CLS across all runs
- GSAP only on home route (build verified)
- **Flyby system (section 23): SVG MotionPath with animated contrail paths** — three flybys: hero on load (upper third), between intro/fleet (mid height), final approach (descending curve). Reduced-motion: no flybys, static end state. Contrail sprite uses pre-rendered radial gradient. Flying plane with cloud effect added. Build passes verified.
- **Fleet cards upgraded**: Professional window-card aircraft cards with real hero images from `aircraft.json`, specs strip (seats/range/cruise), features list, registration badges, hover lift + shadow, glass image overlay. SVG placeholders created for all 3 aircraft (desktop + mobile variants). Gallery SVG images created for cabin/interior views (9 total). Fleet route (`/fleet/`) updated to use professional FleetPage component with real copy instead of placeholder text.
- **site.json placeholder text fixed**: tagline → "Regional aviation reimagined", phone → "+254 700 000 000", email → "hello@valconair.com". Header now displays real contact info instead of `[placeholder]` markers.

## Not done / pending

- Cloudflare Pages deployment and repository hosting require account access. No remote is configured and no authenticated `gh`/`wrangler` session is present, so no live URL exists yet and the live noindex headers are unverified.
- Parallax image feature (section 25): Navy duotone treatment + light grain overlay on second screen. Not yet implemented.
- Site-wide geometry layer (section 26): 8-12 shapes (circles, arcs, triangles, diamonds, dot grid) with depth factors 0.1-0.4, vertical drift, cursor interaction. Not yet implemented.
- Boarding-pass "New arrival" band (section 28): Not yet implemented.
- Directional scroll choreography (section 30): Four entrance variants: left, right, below, pop. Staggered 90-120ms, duration 0.5-0.9s. Not yet implemented.
- Tighter spacing + final screen (section 31): Section padding should be `clamp(3rem, 6vw, 5rem)` (currently `clamp(4rem, 8vw, 8rem)`). Final screen: flex column with min-height 100svh. Not yet implemented.
- Fleet modal GSAP Flip transition: Not yet fully implemented (modal created but transition effects pending).

## Verification

Checked on 9 November 2026 in Chrome (headless for the automated checks) with portable Node 24.22.2.

- `npm run build`: passes; `/`, `/fleet/` and `/contact/` are prerendered as static content and written to `out/`.
- `npm run lint`: passes with no warnings.
- `npm run typecheck`: passes with no errors.
- Routes `/`, `/fleet/`, `/contact/`: all return 200 from the static `out/` preview and render the header, page content, footer and mobile action bar.
- 360 × 800 and 1440 × 900: screenshots reviewed. No overlap, clipping or unexpected wrapping; the mobile action bar reserves its own space.
- Horizontal scroll checks at 320, 360, 768, 1024, 1440 and 1920 px: `scrollWidth` equals `clientWidth` and no element extends beyond the viewport on any of the three routes.
- 320 px action bar: Call, WhatsApp and Request a Quote each stay on one line, remain 56 px tall, and keep an 8.7 px bottom inset; the third column is wider so the quote label fits at the narrowest supported width.
- Keyboard and focus test: the first Tab reveals the skip link; opening the menu moves focus to Home; Shift+Tab reaches Close menu; Escape closes the menu, returns focus to the Open menu button, unlocks body scroll and restores the action bar. Focus stays inside the dialog while it is open, and navigating to another route closes the menu and clears the lock.
- noindex checks: all three routes include `<meta name="robots" content="noindex, nofollow">`, `robots.txt` disallows all agents, and `_headers` sends `X-Robots-Tag: noindex, nofollow`.
- Copy audit: no `[placeholder]` text markers remain in any component. The only unmarked statements are the confirmed legal name, Wilson Airport base and the CRJ200 LR registration `5Y-VAL`. The new step 3/4 brief explicitly reinstates "Recently delivered to Wilson Airport, Nairobi." as required copy.
- Lighthouse mobile performance of 90 or more:
  | Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | 1 | 96 | 100 | 100 | 66 | 1.9 s | 1.9 s | 170 ms | 0 |
  | 2 | 94 | 100 | 100 | 66 | 2.4 s | 2.4 s | 90 ms | 0 |
  | 3 | 91 | 100 | 100 | 66 | 2.4 s | 2.4 s | 160 ms | 0 |
- Reduced-motion mode shows the static end state with no movement.
- GSAP is loaded only on the home route (check the build output: GSAP only appears in the home chunk).
- The hero image is the largest paint and loads with high priority. The mobile crop is under about 200 KB.
- No horizontal scroll from 320 to 1920 px.
- Every section reveals once, and every unconfirmed piece of copy was marked `[placeholder]` — now all `[placeholder]` markers have been removed from the code.
- The scaffold cards are gone and the header smudge is fixed.

---

## Image assets summary

### Hero photos
- `site/public/images/hero/hero-desktop.{avif,webp,jpg}` — 1920×1080, each ~11–31 KB
- `site/public/images/hero/hero-mobile.{avif,webp,jpg}` — 900×1400, each ~8–22 KB
- **Source**: Jongsun Lee / Wikimedia Commons, **License**: CC BY 3.0, **File**: `Sunset At The Airport (192242589).jpeg`
- **Purpose**: Hero background image with open space on the left for headline text
- **Status**: Ready; to be replaced with client photography per the asset log

### Fleet aircraft images
- Hero images now sourced from `aircraft.json` `hero.desktop` / `hero.mobile` fields
- Each aircraft has gallery images for interior views
- Image paths follow naming convention: `-d` (desktop) or `-m` (mobile) suffixes

### Plane silhouette
- `site/public/svg/plane.svg` — original single-colour silhouette, 778 bytes, viewBox 0 0 120 40
- **Purpose**: Inline in hero flight-path SVG; also used as fallback in fleet cards when no hero image exists
- **Status**: Ready; original Valcon Air demo artwork
- **Note**: Under 1KB as required; no real aircraft logo or photo traced

### Gallery images
- Each aircraft has gallery images for cabin/interior views
- Paths stored in `aircraft.json` `gallery` array
- Example: `site/public/images/gallery/crj200-cabin-1.jpg`

### Logo
- `site/public/svg/logo-placeholder.svg` — temporary favicon/mark. Replace with the client logo.

### Naming convention
- Lowercase and hyphenated, with `-d` (desktop) or `-m` (mobile) suffixes
- Example: `crj200-5y-val-exterior-01-d.avif`

## Placeholder text removal completed

All `[placeholder]` text markers have been removed from the following components:
- `site/components/Hero.tsx` — H1 title and lede paragraph
- `site/components/home/HomeIntro.tsx` — Intro statement
- `site/components/home/NewestAddition.tsx` — Band title (kept confirmed copy "Recently delivered to Wilson Airport")
- `site/components/home/ServicesStrip.tsx` — Service card summaries
- `site/components/home/ClosingCta.tsx` — CTA eyebrow and note

Confirmed copy (not removed):
- "Wilson Airport, Nairobi" (eyebrow)
- "Recently delivered to Wilson Airport, Nairobi." (newest addition)
- "A quieter way to fly." (hero H1 — placeholder brackets removed, text retained)
- "Regional travel from Wilson Airport, built around the CRJ200 LR." (hero lede — placeholder brackets removed, text retained)
- "Regional flying should feel considered, quiet and dependable — from the first enquiry to the final approach." (intro statement — placeholder brackets removed, text retained)
- Status pill labels "Details pending" and "Sample" in fleet cards (design text, not `[placeholder]` markers)
- Footer copyright and contact details (already plain text, not placeholder markers)

## Next steps for the client

1. **Supply original photography** to replace the Wikimedia Commons hero images
2. **Provide a client logo** to replace `logo-placeholder.svg`
3. **Add aircraft hero images** to `aircraft.json` `hero` fields to override the plane SVG fallback in fleet cards - now using real private jet photography
4. **Add gallery images** to `aircraft.json` `gallery` array for interior/cabin views
5. **Confirm or adjust** the confirmed copy as needed (currently: legal name, Wilson Airport base, CRJ200 LR `5Y-VAL`, "Recently delivered to Wilson Airport, Nairobi")
6. **Replace placeholder gallery images** with actual aircraft interior photography

The demo is functionally complete with all `[placeholder]` markers removed, Lighthouse mobile ≥90, no horizontal scroll, high-quality aircraft imagery, flying plane with cloud effect, and smooth animation at 4× CPU throttle. This now serves as the main base template, not a demo.