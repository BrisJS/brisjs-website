# Design: Meetup Past-Events Enrichment

> **Status:** draft (backlog)
> **Last updated:** 2026-06-12
> **Depends on:** feature 001 (Event/Talk/Speaker types), feature 003 (import tooling)

## Architecture Overview

A standalone, idempotent **import/enrichment job** (lives with the feature-003 migration
tooling, e.g. `cms/scripts/`) that: acquires BrisJS event data from Meetup → normalises it →
dedupes against existing CMS content → upserts missing **Event** records (and best-effort
**Talk**/**Speaker**) as **drafts** for organizer review. It runs out-of-band; the site keeps
rendering from the CMS as usual (ADR-004/005).

## Acquisition options (the core decision)

| Option | How | Pros | Cons / Risks |
| ------ | --- | ---- | ------------ |
| **Meetup GraphQL API** | `https://api.meetup.com/gql` with OAuth 2.0; query the `brisjs` group's past/upcoming events | Structured, stable, ToS-clean, supports ongoing sync | Requires OAuth + likely a **Meetup Pro** subscription; the old REST/`sig` API is dead (404 confirmed) |
| **Web scraping** | Fetch `meetup.com/brisjs/events/?type=past`, parse HTML / embedded JSON | No paid API; works without org credentials | Fragile to markup changes; **ToS likely prohibits scraping**; `robots.txt`/rate limits; legal review needed |

**Recommendation to evaluate first:** the GraphQL API (clean + supports FR-05 sync). Fall back
to a one-off scrape only for historical backfill if API access is unavailable, and only after a
ToS check. Decision to be recorded as an ADR when the feature is picked up.

## Data Model

No new content types — reuses feature 001:

- **Event** ← Meetup event (title→name, dateTime, description, venue, + optional attendee count
  / photo). Consider an `externalSource` / `meetupEventId` field on Event to track provenance
  and power dedup (small additive change to feature 001 if adopted).
- **Talk** / **Speaker** ← best-effort extraction from the event description (often a list like
  "Speaker — Title"). Low confidence; always draft + human review.

## Data Flow

```mermaid
sequenceDiagram
    participant Job as Enrichment job (cms/scripts)
    participant Meetup
    participant Norm as Normalise + dedup
    participant Strapi
    Job->>Meetup: fetch past/upcoming brisjs events (API or scrape)
    Meetup-->>Job: raw events
    Job->>Norm: map → Event view models; match by date + title
    Norm->>Strapi: upsert MISSING events as drafts (skip existing)
    Note over Strapi: organizer reviews drafts, then publishes
```

## Deduplication

- Key on `meetupEventId` when available; otherwise fuzzy-match on `(date, normalised title)`.
- Existing migrated content (from feature 003) is the source of truth — enrichment fills gaps,
  never overwrites. Re-runs are idempotent (upsert by the chosen key).

## Key Design Decisions (to confirm at pickup)

| Decision | Alternatives | Rationale |
| -------- | ------------ | --------- |
| API-first, scrape as fallback | Scrape-first | API is stable + ToS-clean; scrape is fragile/legally risky |
| Import as drafts for review | Auto-publish | Meetup descriptions are messy; needs a human pass |
| Reuse feature-001 types (+ provenance field) | New "MeetupEvent" type | Keep one Event model; track source via a field |
| Job lives in `cms/scripts` with feature-003 tooling | Separate service | Shares import/dedup utilities |

## Open Design Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Add a `meetupEventId` / `externalSource` provenance field to feature-001 `Event`? | — | — |
| 2 | LLM-assisted parse of event descriptions into Talks, or manual entry? | — | — |
| 3 | If ongoing sync (FR-05): where does it run — a scheduled GitHub Action, a Strapi cron, or manual? | — | — |
