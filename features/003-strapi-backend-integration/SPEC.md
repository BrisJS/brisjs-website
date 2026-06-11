# Spec: Strapi Backend Integration

> **Status:** planning
> **Feature folder:** `features/003-strapi-backend-integration/`

## Overview

Stand up and configure the **Strapi Cloud** instance (free plan, ADR-002, ADR-005) that backs
the site: create the content types designed in feature 001, set permissions so the public API
is read-only for published content, issue a build-time API token for the Astro frontend
(feature 002), and wire a publish **webhook → Netlify build hook** (feature 004) so content
changes trigger a redeploy. Also covers migrating legacy content into Strapi.

## Goals

- A running Strapi Cloud project with the feature-001 content types created.
- Public role configured for **read-only access to published entries only**.
- A scoped, read-only **API token** for the Astro build, stored in Netlify env (feature 004).
- A **publish webhook** that triggers a Netlify rebuild on content change.
- CORS configured to allow the Astro build/host.
- Legacy content migrated (talks/speakers/events/jobs/requests/static pages).

## Non-Goals

- Designing the content model (feature 001 owns the schema).
- Building the frontend (feature 002) or Netlify config itself (feature 004).
- Self-hosting Strapi (deferred — ADR-002 future option).

## Functional Requirements

### FR-01: Provision Strapi Cloud project

Create the Strapi Cloud project (free plan) and a local Strapi dev project mirroring it for
schema development; deploy the content types from feature 001.

### FR-02: Roles & permissions

Configure the **Public** role to `find`/`findOne` published entries for the public-facing
types; deny create/update/delete. Keep admin/editor actions to authenticated organizer accounts.

### FR-03: Build API token

Create a **read-only** API token for build-time fetching. The token is consumed only by the
Astro build (feature 002) and stored as a Netlify environment variable — never in the repo.

### FR-04: Publish webhook → Netlify build hook

Configure a Strapi webhook on publish/update/delete of public content to call the Netlify
**build hook** URL, triggering a site rebuild so changes go live.

### FR-05: CORS & API base

Set CORS to allow the Astro site/build origin. Document the API base URL (Strapi Cloud project
URL) for feature 002/004 env configuration.

### FR-06: Content migration

Import legacy content into Strapi per the feature-001 migration mapping (Google Sheet talks,
`data/twitter.json` speakers, Meetup events, GitHub-issue jobs/requests, static page copy).

## Constraints

- Stay within **Strapi Cloud free-plan** limits (entries, seats, bandwidth, API rate) —
  validate before/while migrating.
- No secrets in the repo or client bundle; tokens live in platform env only.
- Preserve a self-host migration path (avoid Cloud-only lock-in where avoidable).
- Publication workflow: only **published** content is ever served publicly.

## Success Criteria

- [ ] Strapi Cloud project live with feature-001 content types.
- [ ] Public API returns only published entries; writes denied to the public role.
- [ ] Read-only build token issued and working from a build.
- [ ] Publishing content triggers a Netlify rebuild via webhook.
- [ ] Legacy content migrated and spot-checked against the live old site.
- [ ] Free-plan limits confirmed sufficient (or risks recorded in Open Questions).

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Exact Strapi Cloud free-plan limits, and headroom vs the historical talks archive size? | — | — |
| 2 | How are media/images stored (Strapi Cloud media library vs external/CDN) within free-plan quota? | — | — |
| 3 | Do we import the *full* talk history or only recent talks initially? (ties to feature 001 Open Q2) | — | — |
| 4 | Organizer accounts/seats needed vs free-plan seat limit? | — | — |
