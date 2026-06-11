# Spec: Netlify Deployment & Hosting

> **Status:** planning
> **Feature folder:** `features/004-netlify-deployment/`

## Overview

Configure Netlify to build and host the Astro frontend (feature 002), sourcing content from
Strapi Cloud (feature 003) at build time (ADR-005). Covers the build configuration
(`netlify.toml`), environment variables, a build hook for content-triggered rebuilds, legacy
URL redirects, and the custom domain (`brisjs.org`) — including correcting the stale `CNAME`.

## Goals

- A reproducible Netlify build of the Astro site (`netlify.toml`: build command, publish dir, Node version).
- Environment variables for the Strapi API URL + read-only token (no secrets in the repo).
- A **build hook** URL wired to the Strapi publish webhook (feature 003) for auto-rebuild.
- Redirects from legacy routes (notably `#talk-<id>` and any old paths) to new Astro routes.
- The site served at `brisjs.org` over HTTPS, with the `CNAME`/DNS reconciled.

## Non-Goals

- Building the Astro app (feature 002) or configuring Strapi (feature 003).
- Choosing the talk slug scheme (feature 002 Open Q2) — this feature consumes it for redirects.
- CI test gates (covered by `docs/TEST_STRATEGY.md` as it matures).

## Functional Requirements

### FR-01: Build configuration

Add `netlify.toml` defining the build command (`astro build`), publish directory (`dist/`),
and a pinned Node version. Deploy on push to the default branch.

### FR-02: Environment variables

Configure `STRAPI_API_URL` and `STRAPI_API_TOKEN` in Netlify (build context), consumed by the
Astro data layer (feature 002). No secret is committed.

### FR-03: Build hook for content updates

Create a Netlify **build hook** and provide its URL to feature 003's Strapi webhook so that
publishing content triggers a rebuild/redeploy.

### FR-04: Legacy redirects

Provide redirects (via `netlify.toml` `[[redirects]]` and/or `_redirects`, plus client-side
handling for hash URLs) so old links — especially `#talk-<id>` — resolve to the new talk
routes. Avoid breaking existing inbound links.

### FR-05: Custom domain & HTTPS

Serve the site at `brisjs.org` with automatic HTTPS. Reconcile the repo `CNAME` (currently
`bris.js.org`) and DNS so the canonical domain is correct and consistent (resolves HLD Open
Question 1).

### FR-06: Deploy previews

Enable Netlify deploy previews for PRs so changes can be reviewed before merge.

## Constraints

- No secrets in the repo; all tokens via Netlify env.
- Build must succeed only with complete content (a failed Strapi fetch fails the build —
  feature 002 FR/edge), so a bad build doesn't replace a good deploy.
- Keep the existing push-to-deploy simplicity (ADR-005).

## Success Criteria

- [ ] Push to the default branch builds and deploys the Astro site on Netlify.
- [ ] Publishing in Strapi triggers a rebuild via the build hook.
- [ ] `STRAPI_*` env vars present in Netlify; none committed to the repo.
- [ ] Legacy `#talk-<id>` (and other old) links redirect to the correct new pages.
- [ ] `brisjs.org` serves over HTTPS; `CNAME`/DNS reconciled and documented.
- [ ] PR deploy previews work.

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Is the repo `CNAME` (`bris.js.org`) stale vs the live `brisjs.org`, and who controls DNS? (HLD Open Q1) | — | — |
| 2 | Hash-based legacy URLs (`#talk-<id>`) can't be server-redirected — handle via a client shim on the home page? | — | Resolved 2026-06-11: yes — client shim with a build-generated `legacyId → slug` map, fallback to `/talks` (see DESIGN + BUILD_WORKFLOW T3.1) |
| 3 | Does the existing Netlify project get reused/reconfigured, or is a new project created for the Astro build? | — | — |
| 4 | Build minutes/bandwidth on the current Netlify plan vs rebuild frequency from content publishes? | — | — |
