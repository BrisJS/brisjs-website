# Requirements: Meetup Past-Events Enrichment

> EARS format. Backlog feature — refine when picked up after the core migration.

## User Stories

### US-01: Organizer backfills earlier history

**As a** BrisJS organizer,
**I want to** import past events from Meetup that predate the website's archive,
**So that** the site shows a more complete history of the meetup.

#### Acceptance Criteria

- **WHEN** the enrichment job runs, **THE SYSTEM SHALL** create CMS Event records for past
  Meetup events not already present.
- **THE SYSTEM SHALL** import enriched records as **drafts** for organizer review before publish.

---

### US-02: No duplicates

**As a** maintainer,
**I want** enrichment to skip events already in the CMS,
**So that** re-running it never creates duplicates.

#### Acceptance Criteria

- **WHEN** an event already exists (matched by id or date+title), **THE SYSTEM SHALL** skip or
  update it rather than insert a duplicate.
- **THE SYSTEM SHALL** be safely re-runnable (idempotent).

---

### US-03 (optional): Ongoing sync

**As a** BrisJS organizer,
**I want** new Meetup events to flow into the CMS automatically,
**So that** I don't manually re-enter them.

#### Acceptance Criteria

- **WHILE** ongoing sync is enabled, **THE SYSTEM SHALL** pull new past/upcoming events on a
  schedule and add them as drafts.

## Edge Cases & Error States

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| Meetup API access unavailable / not Pro | Job reports clearly; fall back per the acquisition decision; don't half-import |
| Event description has no parseable talks | Import the Event only; leave Talks for manual entry |
| Fuzzy match ambiguous (similar title/date) | Flag for human review rather than guess-merge |
| Meetup markup/schema changes (if scraping) | Fail loudly with a clear error, don't import garbage |

## Out of Scope

- Overwriting or deleting curated CMS content.
- Guaranteed per-talk structured extraction.
- Embedding live Meetup data on the rendered site.
