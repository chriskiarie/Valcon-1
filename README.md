# Valcon Air website

Static Next.js site for Valcon Air Solutions Limited (Wilson Airport, Nairobi).

## Layout

- `site/` the app that gets deployed (Next.js App Router, static export)
- `docs/` asset log, image pipeline script, cutout proofs
- `scripts/` one-off tooling (aircraft cutout)
- `assets-source/` originals, never deployed (large raw photos are git-ignored)

The old Concept B "Nightfall" build is archived at tag `archive/concept-b-nightfall`.

## Branches

- `master` is production. Deploys automatically. Only merge work that has been built and checked.
- `develop` is the integration branch: everything lands here first, then goes to `master` in one reviewed merge.
- `feature/<name>` short-lived branches off `develop` (for example `feature/cms-dashboard`).
- `hotfix/<name>` off `master`, merged to `master` and back into `develop`.

Delete a feature branch once it is merged.

## Before merging to master

1. `cd site && npm ci && npm run lint && npx tsc --noEmit && npm run build`
2. Open the preview deployment from the branch and check `/`, `/fleet/`, `/contact/` at 360, 768 and 1440 px.
3. Hero flyby plays once, with a contrail, no frozen plane; reduced motion shows none.

## Run locally

```
cd site
npm ci
npm run dev
```
