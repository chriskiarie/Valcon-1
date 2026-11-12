# CMS setup runbook (Sanity project 9sifbw9w, dataset production)

Things only the project owner can do (they need your Sanity and Vercel logins).

## 1. Import the starting content (once)

```
cd studio
npm install
npx sanity login
npx sanity dataset import seed/seed.ndjson production --replace
```

This creates Site settings, Home page, Fleet and contact pages, 3 aircraft and 4 services from the current site
content. It does not upload photos: until an editor uploads one, the site keeps using the image already in
`site/public`. Regenerate the seed any time with `node scripts/make-seed.mjs`.

## 2. Run or publish the Studio

```
cd studio
npm run dev          # local, http://localhost:3333
npx sanity deploy    # hosted for the client, pick a name such as valcon-air
```

## 3. Make the dataset readable by the build

The site build reads published content without a token, so the dataset must be public-read (the Sanity default).
Check at sanity.io/manage > the project > Datasets > production > Public. If you keep it private, create a
read-only token (API > Tokens) and set `SANITY_API_TOKEN` in Vercel.

## 4. Vercel project settings

- Root directory: `site`
- Build command: `npm run build` (this runs the content sync first)
- Environment variables: `NODE_VERSION` = your Node LTS major. Add `CMS_SYNC_STRICT=1` on Production only, so a
  broken CMS fails the build visibly instead of quietly shipping old content. Leave it unset on previews.

## 5. Publish triggers a rebuild

1. Vercel > Project > Settings > Git > Deploy Hooks > create one for the production branch, copy the URL.
2. sanity.io/manage > the project > API > Webhooks > create:
   - URL: the Vercel hook URL, Method POST
   - Dataset: production, Trigger on: Create, Update, Delete
   - Filter: `_type in ["siteSettings","homePage","pagesContent","aircraft","service"]`
   - Drafts: off (only published changes rebuild)
3. Publish a small edit and confirm a Vercel build starts. The change is live in about 1 to 2 minutes.

## 6. Users

sanity.io/manage > the project > Members > invite the client lead (Administrator) and the social media admin
(Editor, or Administrator if they should publish; Editors can publish by default, so say so if that is not wanted).

## Local development

- `npm run dev` and `npm run build` in `site/` run `scripts/sync-sanity.mjs` first.
- No network or Sanity down: it falls back to `site/content/*.json` and the build still succeeds.
- `SKIP_CMS_SYNC=1` forces the committed JSON. `site/content/generated/` and `site/public/images/cms/` are
  git-ignored build output.

## Editing rules built into the sync

- Contact details, social links and the three notices are authoritative: clearing a field removes it from the site.
- Everything else falls back to the committed JSON when left blank.
- If any aircraft exist in the CMS, the CMS list replaces the committed list (delete an aircraft in the Studio to
  remove it). Same for services.
- Photos are resized and converted at build time (hero AVIF, WebP and JPG at about 1920 x 1080 and 900 x 1400).
  The build logs a warning for any file over 250 KB.
