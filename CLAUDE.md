# CLAUDE.md

## Project

BrisJS website — the site for the Brisbane JavaScript meetup, live at `brisjs.org`.

**Current state:** a ~9-year-old client-side SPA (Browserify + Handlebars, single
`index.html`, `app.js` → `app.min.js`). Content is fetched at runtime from external sources:
a Google Sheet (talks), the Meetup API (events), GitHub issues (jobs + talk requests), and
committed JSON (`data/twitter.json` speaker cache, `data/contact.json` organizers). Deployed
as static assets to Netlify on push to `master`. No backend, no database, no tests.

**Direction:** migrating to a CMS-backed architecture. Adopted stack: **Astro** frontend
(ADR-004) deployed on **Netlify**, reading content at build time from **Strapi Cloud** (free
plan, ADR-002/ADR-005; future self-host option preserved). The frontend first **ports the
current design as-is** (feature 002) — any redesign is a separate later feature. See
`docs/DESIGN_DECISIONS.md` (ADR-002 through ADR-005) and the migration features:
`features/001-strapi-content-modeling`, `002-astro-frontend`, `003-strapi-backend-integration`,
`004-netlify-deployment`, and `005-design-refresh` (the deferred redesign). The
dynamic-vs-static content split (what's CMS-driven via Strapi vs hard-coded Astro layout) is
mapped in `features/002-astro-frontend/DESIGN.md`.

> Note: the repo `CNAME` currently reads `bris.js.org` while the live domain is `brisjs.org`
> (see `docs/HLD.md` Open Questions).

## Documentation

This project uses a two-tier documentation system. Read `docs/INDEX.md` first.

- **System-wide design** lives in `docs/` (INDEX, HLD, ARCHITECTURE, DESIGN_DECISIONS,
  API_SPECIFICATION, TEST_STRATEGY, NON_FUNCTIONAL_TESTING).
- **Feature-scoped design** lives in `features/NNN-<slug>/`, created by copying
  `features/_template/` (SPEC, REQUIREMENTS, DESIGN, TEST_CASES, PROMPT).

### Rules
- Before building a feature, create `features/NNN-<slug>/` from `_template/`, fill
  SPEC → REQUIREMENTS → DESIGN → TEST_CASES, and add a row to `features/FEATURES.md`.
- `docs/DESIGN_DECISIONS.md` is append-only — add a new ADR, never edit past ones.
- Record any architectural choice as an ADR; record uncertainty in an Open Questions table.
- Requirements use EARS syntax; decisions use ADR format; IDs (FR-/US-/TC-/ADR-/P-) are referenceable.
- Keep `docs/` in sync with reality — update HLD/ARCHITECTURE when topology or principles change.
- The current `docs/HLD.md` and `docs/ARCHITECTURE.md` describe the **current** (pre-migration)
  system; migration-target design lives in Proposed ADRs and feature folders until adopted.
