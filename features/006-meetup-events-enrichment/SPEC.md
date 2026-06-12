# Spec: Meetup Past-Events Enrichment

> **Status:** planning (backlog — pick up after the core migration, features 001–004, ships)
> **Feature folder:** `features/006-meetup-events-enrichment/`
> **Depends on:** feature 001 (Event/Talk content types), feature 003 (migration/import tooling)

## Overview

BrisJS published events on its Meetup page (`meetup.com/brisjs`) **before** the website began
showing talks, and Meetup continues to hold event history the site never captured. This feature
explores **enriching the CMS with historical (and optionally upcoming) event data sourced from
Meetup** — via the Meetup API or by scraping the public events pages — to backfill the archive
earlier than the current Google-Sheet-derived data and to keep events fresh.

It is an **enrichment pass on top of** the primary migration, not part of it. It is captured now
so it can be picked up deliberately when the core site is live.

## Goals

- Backfill **Event** records (and, where extractable, **Talk** records) for BrisJS meetups that
  predate or are missing from the current archive.
- Optionally provide an **ongoing sync** of upcoming/past events from Meetup into the CMS
  (revisits feature 001 Open Q3, which currently has events fully manually managed in Strapi).
- Deduplicate against already-migrated content so enrichment never creates duplicates.
- Make a clear, documented choice between **Meetup API** and **web scraping**, including the
  legal/ToS and reliability trade-offs.

## Non-Goals

- The core migration (features 001–004) — this builds on it, doesn't replace it.
- Perfect per-talk extraction. Meetup models **events**, not individual talks; talk-level detail
  usually lives in free-text event descriptions, so Talk extraction is best-effort.
- Real-time/live embedding of Meetup on the site (we render from the CMS, ADR-004/005).

## Functional Requirements

### FR-01: Acquire Meetup event history

Retrieve past BrisJS events (title, date/time, description, venue, attendee count, photos where
available) from Meetup — source TBD (API vs scrape, see Open Questions / DESIGN).

### FR-02: Map to CMS content

Transform acquired events into feature-001 **Event** records; where the event description
contains structured-enough talk/speaker info, optionally create related **Talk**/**Speaker**
records (best-effort, flagged for human review).

### FR-03: Deduplicate & backfill only gaps

Match against existing CMS events/talks (by date + title similarity) and only insert what's
missing, preferring existing migrated records as source of truth. Idempotent / re-runnable.

### FR-04: Human review queue

Imported-from-Meetup records land as **drafts** (or tagged) so an organizer can verify before
publishing — Meetup descriptions are messy and need a human pass.

### FR-05 (optional): Ongoing sync

A repeatable job that pulls new past/upcoming events from Meetup on a schedule, if the team
decides automated sync is worth the maintenance over manual entry.

## Constraints

- The legacy Meetup REST API is **dead** (the old signed URL returns HTTP 404 — confirmed
  2026-06-12, `docs/HLD.md` Open Q2). Any API route must use Meetup's current **GraphQL API**,
  which requires OAuth and may require a **Meetup Pro** subscription.
- Scraping must respect Meetup's Terms of Service and `robots.txt`; treat it as a fallback and
  document the legal position before adopting it.
- No secrets (Meetup OAuth tokens) in the repo or client bundle.
- Enrichment is **additive** and reviewable — never overwrite or delete curated CMS content.

## Success Criteria

- [ ] A documented decision on acquisition method (API vs scrape) with trade-offs.
- [ ] Historical events earlier than the current archive are imported as reviewable drafts.
- [ ] No duplicates created against already-migrated content; re-runs are safe.
- [ ] Organizer can review and publish enriched records.

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Meetup **GraphQL API** vs **scraping** the public events pages — which is viable given auth/Pro requirements and ToS? | — | — |
| 2 | Does BrisJS have (or can get) Meetup organizer API access / a Pro account for the GraphQL API? | — | — |
| 3 | One-time historical **backfill** only, or **ongoing sync** too (FR-05)? Ties to feature 001 Open Q3 | — | — |
| 4 | How far back does Meetup's BrisJS history go, and how much predates the website's data? | — | — |
| 5 | How much per-talk detail is extractable from event descriptions vs needing manual entry? | — | — |
| 6 | Is scraping Meetup acceptable under their ToS, or API-only? | — | — |
