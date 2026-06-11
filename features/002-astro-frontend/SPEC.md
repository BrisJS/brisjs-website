# Spec: Astro Frontend

> **Status:** planning
> **Feature folder:** `features/002-astro-frontend/`

## Overview

Rebuild the public BrisJS website as an **Astro** application (ADR-004) that statically
generates its pages at build time from the Strapi REST API (ADR-002). This replaces the
current Browserify + client-side-Handlebars SPA and fixes its SEO/performance weaknesses,
while **preserving the current look and feel as faithfully as reasonable** — the visual
design is ported, not redesigned. A separate later feature will draft any change to the look
and feel. This feature covers the frontend application only; CMS content modelling is feature
001, Strapi provisioning is feature 003, and Netlify hosting is feature 004.

## Goals

- A statically generated Astro site rendering all current page types.
- A typed data-access layer that fetches published content from the Strapi API at build time.
- Minimal client-side JS (Astro islands only where interactivity is genuinely needed).
- Reproduce the current visual design as faithfully as reasonable (port `style.css` and the
  existing Semantic-UI-based look), restructured into Astro components/layouts.
- Preserve meaningful URLs (and redirect legacy `#talk-<id>` hash routes — see feature 004).

## Non-Goals

- Strapi content modelling (feature 001) and provisioning/permissions (feature 003).
- Netlify build/deploy/domain configuration (feature 004).
- **Any redesign / change to the look and feel** — deferred to feature 005 (design refresh);
  this feature ports the existing design as-is.
- Authoring tools or content submission from the website (organizers edit in Strapi).

## Functional Requirements

### FR-01: Page set

Generate these pages: Home (CMS intro copy + next/upcoming event), Talks archive (grouped by
event/month), Talk detail (per talk), Jobs, Talk requests, Contact (organizers), Code of
Conduct, Find Us. Optionally a Speakers listing if feature 001's Speaker type warrants it. See
the **Content & Rendering Map** in `DESIGN.md` for which areas are CMS-driven vs static Astro.

### FR-02: Strapi data-access layer

A single typed module fetches from the Strapi REST API (`/api/talks`, `/api/events`,
`/api/speakers`, `/api/job-postings`, `/api/talk-requests`, `/api/code-of-conduct`,
`/api/find-us`) with `populate` for relations, returning view models the pages consume.

### FR-03: Build-time data fetching

All content is fetched at build time (SSG). No runtime calls to Strapi from the browser; the
Strapi token is used only during the build.

### FR-04: Dynamic talk routes

Talk detail pages are generated per talk via Astro's `getStaticPaths`, keyed by a stable slug
or `legacyId` so old URLs can be redirected (feature 004).

### FR-05: Port the current design

Reproduce the current site's appearance as faithfully as reasonable: carry over `style.css`
and the existing Semantic-UI-based styling, re-expressed through Astro layouts/components
(talk cards, speaker cards, event banner). Keep it responsive and accessible (WCAG 2.1 AA
intent per `docs/NON_FUNCTIONAL_TESTING.md`). No visual redesign in this feature.

### FR-06: Graceful empty/missing content

Missing optional fields (no video/slides/code, no speaker) render cleanly, mirroring the
current template behaviour in `templates/talk.hbs`.

## Constraints

- SSG by default; no secrets in client output (Strapi token build-time only).
- Stay framework-idiomatic (Astro components, file-based routing, content collections or
  fetch-at-build as appropriate).
- Output must deploy as static assets on Netlify (feature 004).

## Success Criteria

- [ ] All page types from FR-01 build and render from Strapi data.
- [ ] No client-side Strapi calls; no token in shipped output.
- [ ] Visual output is recognisably the current design (side-by-side parity on key pages).
- [ ] Lighthouse Performance ≥ 90 and SEO ≥ 95 on key pages (target).
- [ ] Talk detail pages generated for every published talk; legacy URLs redirectable.
- [ ] Responsive + keyboard-navigable; passes an a11y smoke check.

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Slug strategy for talks — derive from title, or keep `legacyId` for stable redirects? | — | — |
| 2 | Do we keep showing the *upcoming* event from the live Meetup API, or only Strapi-managed events? (ties to feature 001 Open Q3) | — | — |
| 3 | How is the current look ported — keep Semantic UI (CDN/local) as-is, or extract just the used styles from `style.css`? | — | — |
| 4 | Is a standalone Speakers page wanted, or are speakers shown only within talks? | — | — |
