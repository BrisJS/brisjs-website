# Design: Astro Frontend

> **Status:** draft
> **Last updated:** 2026-06-11

## Architecture Overview

An Astro site that statically generates pages at build time from the Strapi REST API
(ADR-002, ADR-004). A single data-access layer wraps Strapi fetches and returns typed view
models; Astro pages and components consume those models. Output is static HTML/CSS/JS deployed
to Netlify (feature 004). The browser never calls Strapi directly — the API token is used only
during the build. **The current visual design is ported as-is** (carry over `style.css` and
the existing Semantic-UI look); any redesign is a separate future feature.

## Data Model

The frontend consumes the Strapi content types defined in feature 001 (Talk, Speaker, Event,
JobPosting, TalkRequest, CodeOfConduct, FindUs). It does not define new persistent data; it
defines **view models** mapped from the Strapi REST shape (`{ data: [{ id, attributes }] }`).

### Derived Validation / Types

If TypeScript is used, generate API types from Strapi's OpenAPI/GraphQL schema (or define
narrow view-model types in the data layer) rather than hand-maintaining duplicates. The Strapi
content-type definitions remain the source of truth.

## Component Structure

```
src/
├── lib/
│   └── strapi.ts            # fetch wrapper (base URL + token from env), populate helpers
├── data/
│   ├── talks.ts             # getTalks(), getTalkBySlug(), groupByEvent()  (port of lib/tsvTalks.js logic)
│   ├── events.ts            # getUpcomingEvent(), getEvents()
│   ├── speakers.ts
│   ├── postings.ts          # jobs + talk requests
│   └── pages.ts             # code-of-conduct, find-us single types
├── layouts/
│   └── BaseLayout.astro     # head/meta, header, footer, OG tags
├── components/
│   ├── TalkCard.astro
│   ├── SpeakerCard.astro
│   ├── EventBanner.astro
│   └── ResourceButtons.astro
├── pages/
│   ├── index.astro          # home + upcoming event
│   ├── talks/index.astro    # archive grouped by event
│   ├── talks/[slug].astro   # talk detail (getStaticPaths)
│   ├── jobs.astro
│   ├── talk-requests.astro
│   ├── code-of-conduct.astro
│   └── find-us.astro
└── styles/
    └── global.css           # ported from the current style.css (+ Semantic UI as needed)
```

> Styling note: this feature **ports** the existing `style.css` and Semantic-UI-based look
> rather than introducing a new design system. A future design feature may replace this.

## Data Flow

```mermaid
sequenceDiagram
    participant Build as Astro build (Netlify)
    participant DL as src/data + src/lib/strapi
    participant API as Strapi REST API
    participant Out as Static HTML/CSS/JS
    Build->>DL: getTalks(), getUpcomingEvent(), ...
    DL->>API: GET /api/talks?populate=speakers,event (Bearer token)
    API-->>DL: published entries
    DL-->>Build: typed view models
    Build->>Out: render pages + getStaticPaths for /talks/[slug]
    Note over Out: deployed to Netlify CDN (feature 004)
```

## State Management

None at runtime — the site is static. "State" is the build-time content snapshot. Any
interactive bits (e.g. mobile nav, optional client-side talk filter) are isolated Astro
islands with local state only.

## API Surface (consumed, not exposed)

| Method | Path | Used by |
| ------ | ---- | ------- |
| `GET` | `/api/talks?populate=speakers,event` | archive + detail |
| `GET` | `/api/events?populate=talks` | home (upcoming) + events |
| `GET` | `/api/speakers?populate=photo` | speaker cards |
| `GET` | `/api/job-postings` | jobs page |
| `GET` | `/api/talk-requests` | talk-requests page |
| `GET` | `/api/code-of-conduct` / `/api/find-us` | static pages |

## Key Design Decisions

| Decision | Alternatives Considered | Rationale |
| -------- | ----------------------- | --------- |
| SSG (build-time fetch) | SSR via Netlify functions | Content site; SSG is faster, cheaper, simpler (ADR-005) |
| Single `src/lib/strapi` wrapper | Fetch inline per page | One place for base URL, token, error handling, populate |
| Port `lib/tsvTalks.js` grouping logic into `src/data/talks.ts` | Rewrite from scratch | Reuse proven grouping/parsing semantics; unit-testable |
| Port current `style.css` + Semantic UI look | New design system now | Migrate design faithfully first; redesign is a deferred feature |

## Diagrams

### Route map

```
/                      → home + upcoming event
/talks                 → archive grouped by event
/talks/[slug]          → talk detail (one per published talk)
/jobs                  → job postings
/talk-requests         → requested talks
/code-of-conduct       → single type
/find-us               → single type
```

## Open Design Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | TypeScript + generated Strapi types, or JS + hand-written view models? | — | — |
| 2 | Talk slug source (title-derived vs `legacyId`) — must align with feature 004 redirects | — | — |
| 3 | Port Semantic UI wholesale (CDN/local) vs extract only the used rules from `style.css`? | — | — |
