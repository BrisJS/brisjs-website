# Human TODO — BrisJS migration cloud wiring (Phase 4 + cutover)

> **Status:** the entire **agent-buildable** scope is done, committed, and CI-green on branch
> `new-modern-refactor-astro-strapi-netlify`. What remains needs accounts, secrets, and DNS —
> things an agent must not do. This is the checklist to take it live. See
> `docs/BUILD_WORKFLOW.md` (Phase 4/5) for the task board and gates.
>
> 📖 **For click-by-click instructions, follow [`docs/SETUP_GUIDE.md`](./SETUP_GUIDE.md)** —
> this page is the summary checklist; the guide has the exact steps, values, and verification.

## What's already built (no action needed)
- `cms/` — Strapi 5, all content types as code, public role read-only, **227 talks / 120
  speakers / 80 events / 1 organizer + 3 single types** importable via `npm run import:legacy`.
- `web/` — Astro site, all pages + components, current design ported (visual parity verified),
  builds from fixtures or a live Strapi.
- `netlify.toml` (`base = "web"`), legacy `#hash` redirect shim, backup/restore runbook.
- CI green (Node 22). Tests: 17 web + verified Strapi import/backup round-trips.

> ⚠️ **Everything below requires Node 22** for Strapi (`nvm use 22`). Node 26 won't boot it.

## H4.1 — Strapi Cloud project
- [ ] Create a Strapi Cloud project (free plan), connect this repo, set the base dir to `cms/`.
- [ ] Create the admin user; confirm the content types appear.
- [ ] Issue a **read-only API token** (for the Astro build).
- [ ] **Verify free-plan limits** vs our data (~227 talks / 120 speakers / 80 events ≈ 454/240/160
      rows with draft+publish) — entries, bandwidth, seats. Record findings in
      `features/001-strapi-content-modeling/SPEC.md` Open Q4 / feature 003 Open Q1.

## H4.2 — Netlify project
- [ ] Connect the repo to Netlify (or reconfigure the existing project). `netlify.toml` already
      sets `base=web`, build, publish, Node 22.
- [ ] Set env vars: `STRAPI_API_URL` (the Cloud REST base, e.g. `https://<proj>.strapiapp.com`)
      and `STRAPI_API_TOKEN` (the read-only token). **Never commit these.**
- [ ] Create a **build hook** (copy its URL for H4.3).
- [ ] Confirm PR **deploy previews** are on.

## H4.3 — Publish → rebuild webhook
- [ ] In Strapi, add a webhook on publish/update/unpublish/delete of public types → the Netlify
      build hook URL (so content changes trigger a redeploy). *(Agent can wire/verify once creds exist.)*

## H4.4 — Migrate content to the cloud + manual content
- [ ] Run the importer against **cloud** Strapi (`STRAPI_*` set, `npm run import:legacy`); spot-check
      vs the live old site. *(Agent can do this with creds.)*
- [ ] **Manual content the importer can't do** (flagged in `cms/README.md`):
  - [ ] Upload **speaker / organizer photos** (legacy data only has image URLs; media needs upload).
  - [ ] Set `FindUs.mapEmbed` (legacy used a static SVG).
- [ ] Take a backup once content is in (`npm run backup`) and store it off Strapi Cloud.

## H4.5 — Domain & DNS
- [ ] Point **`brisjs.org`** at the new Netlify deploy; enable automatic HTTPS.
- [ ] Reconcile the stale repo `CNAME` (`bris.js.org` → `brisjs.org`) — `docs/HLD.md` Open Q1.

## Phase 5 — Cutover (T5.1)
- [ ] Compare the deploy preview against `docs/baseline/*.png`.
- [ ] Merge the branch to `master`.
- [ ] Remove the legacy root SPA (`app.js`, `app.min.js`, `index.html`, `style.css`, `templates/`,
      `lib/`, root `config.json`, etc.) in a dedicated cleanup commit (ADR-006).
- [ ] Update `docs/HLD.md` + `docs/ARCHITECTURE.md` to describe the post-migration system.
- [ ] Flip `features/FEATURES.md` statuses (001–004) to `complete`.

## After go-live (separate cycles, not part of this build)
- **Feature 005** — design refresh (the redesign; current design was ported as-is).
- **Feature 006** — Meetup past-events enrichment (backfill earlier history).
