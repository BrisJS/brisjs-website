# CLAUDE.md

## Project

BrisJS website — the site for the Brisbane JavaScript meetup, live at `brisjs.org`.

**Current state:** a ~9-year-old client-side SPA (Browserify + Handlebars, single
`index.html`, `app.js` → `app.min.js`). Content is fetched at runtime from external sources:
a Google Sheet (talks), the Meetup API (events), GitHub issues (jobs + talk requests), and
committed JSON (`data/twitter.json` speaker cache, `data/contact.json` organizers). Deployed
as static assets to Netlify on push to `master`. No backend, no database, no tests.

**Direction:** we are planning a migration to a CMS-backed architecture (Strapi Cloud free
plan, with a future self-host option) plus a design refresh. See `docs/DESIGN_DECISIONS.md`
(ADR-002, ADR-003) and `features/001-strapi-content-modeling/`.

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
