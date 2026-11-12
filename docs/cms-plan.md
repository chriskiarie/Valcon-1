# CMS plan (locked)

Decision: **Sanity** as the CMS. The client and their social media admin edit content in Sanity Studio;
the static Next.js site rebuilds on publish. No admin code lives in the site.

## Principle

Components never read content directly. They call `lib/content.ts` (`getSite`, `getHome`, `getPages`,
`getAircraft`, `getServices`). Those read `site/content/*.json`. A sync script writes those JSON files from
Sanity at build time, so the JSON files are both the fallback and the contract. If Sanity is unreachable the
build uses the committed JSON and the site still ships.

```
Sanity Studio  ->  publish  ->  deploy hook  ->  build:  npm run content:sync  ->  content/*.json  ->  next build  ->  static site
```

## Content documents (mirror the JSON shapes in `lib/types.ts`)

| Sanity document | JSON file | Editable by client |
|---|---|---|
| siteSettings (singleton) | `site.json` | logo, name, tagline, base address, phone, WhatsApp, email, socials, nav labels, notices (concept pill, footer note, illustrative-images note), WhatsApp message templates, SEO title and description, image credits |
| homePage (singleton) | `home.json` | hero image (desktop and mobile) and copy, intro statement and image, fleet heading, arrival band, services heading, closing call to action |
| pagesContent (singleton) | `pages.json` | fleet and contact page copy and meta descriptions |
| aircraft (list) | `aircraft.json` | add, delete, reorder; name, registration, status, summary, optional specs, photos with focal point and alt text |
| service (list) | `services.json` | add, delete, reorder; title, summary, image |

Stays in code (not content): the 5Y-VAL flyby aircraft image and animation, layout, colours and fonts (`styles/tokens.css`).

## Rules the schemas enforce

- Required: alt text on every image; aircraft name; slug (auto from name).
- WhatsApp number: digits only, with country code, no plus.
- Notices left empty are hidden on the site (concept pill, footer note, illustrative-images note).
- Contact buttons render only when a real value exists (already true in code).
- Image upload limit and recommended sizes shown in the field description (hero 1920x1080 and 900x1400).

## Images

Sanity stores originals on its CDN. The sync script requests resized AVIF, WebP and JPG renditions at build
time and writes them to `site/public/images/cms/`, so the site keeps its static, self-hosted images and its
performance targets (hero under about 200 KB). Editors upload any size; the build does the optimising.

## Roles

- Admin: the client lead (publishes, manages users).
- Editor: the social media admin (drafts and edits; publish permission to be decided with the client).
- Developer: Chris.

## Build order

1. Content layer (done on this branch): all copy and settings flow through `lib/content.ts`.
2. Sanity project and schemas, seeded from the current JSON.
3. `scripts/sync-sanity.mjs` plus `content:sync` hooked into the build, with JSON fallback.
4. Deploy hook from Sanity to the host; publish test end to end.
5. Roles, editor guide for the client, handover.

## Launch checklist (needs the client)

- Real contact details and logo entered in the CMS.
- Client-owned photography replaces the Wikimedia Commons images; credits page at `/credits/`.
- Source and licence for the 5Y-VAL flyby image confirmed.
- Demo wording removed ("concept preview", "first aircraft", "demo draft"); noindex flipped off.
- Domain, DNS and host decided. Vercel Hobby is non-commercial: move to Cloudflare Pages or a paid Vercel plan.
