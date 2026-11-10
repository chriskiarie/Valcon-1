# Decisions

## Node and dependency versions

- Target Node 24 LTS (`24.22.2` when built) with `engines.node` set to `24.x`, `.nvmrc`, and Cloudflare's `NODE_VERSION=24`.
- Pin exact package versions in `site/package.json`, including Tailwind, ESLint and the React type packages. ESLint is held at `9.39.5` because eslint-config-next's bundled plugins do not yet declare support for ESLint 10.
- Do not install GSAP until step 3.

## Next.js and Tailwind

- Keep the app at `site/app` rather than `site/src/app`.
- Use static export with trailing slashes and unoptimised image handling. Images will be optimised before entering `public`.
- The initial create-next-app preferences had enabled Cache Components, partial prefetching and the React Compiler. These experimental features were removed; the config now contains only the static export settings and the Tailwind/Turbopack CSS rule.
- Tailwind 4 is configured through `@theme inline` in `site/styles/tokens.css`. Semantic utility names (`bg-page`, `text-copy`, `font-brand`, `p-4`, `rounded-panel`) alias the raw design tokens. No literal colour or size values are used in components.

## Fonts

- Cormorant Garamond (display) and Manrope (text) are loaded with `next/font/google`, subset to Latin, displayed with `swap`, and self-hosted by the build as `--font-display` and `--font-text`.
- These are placeholder families until the client supplies brand fonts.

## Components and state

- `Header` and `MobileMenu` are client components. `ActionBar` has no interaction, so it stays a server component; it is hidden while the menu is open through a root `data-menu-open` attribute and CSS.
- Menu open state is keyed to the current pathname. A route change therefore makes the menu derive as closed without an extra effect.
- The header scroll state uses an IntersectionObserver on a 1 px sentinel placed 24 px from the top, not a scroll listener.
- The focus trap includes the persistent header menu button so keyboard users can reach the visible close control.
- The action bar is hidden with `visibility` and opacity while the menu is open and remains outside the focus order.
- The action bar's third column is slightly wider than the first two so "Request a Quote" fits on one line at 320 px without shrinking the type.

## Content

- JSON is imported only in `site/lib/content.ts`; components call `getSite`, `getAircraft` and `getServices`.
- Aircraft are sorted by `order`.
- Only confirmed facts are stated plainly (legal name, Wilson Airport base, CRJ200 LR `5Y-VAL`). The aircraft row does not assert an operational status; placeholder rows are labelled "Sample" and the confirmed row "Details pending".
- All unconfirmed copy remains marked `[placeholder]`, including contact details and the copyright line.
- The quote link points to the stub panel with `id="quote"` on the contact page.

## Accessibility and motion

- Focus rings use a dedicated high-contrast token and an inverse token on dark surfaces.
- Menu animation only changes opacity and translateY.
- The global reduced-motion rule reduces animation, transition and smooth-scroll durations.
- The mobile action bar reserves the bar height plus the safe-area inset in body padding.
