# Prompts: Meetup Past-Events Enrichment

> Backlog feature — run only after the core migration (001–004) is live. Start by resolving the
> acquisition decision (Open Question 1) before writing the importer.

---

## P-01: Spike — viability of the acquisition method

**Context files to load:**
- `features/006-meetup-events-enrichment/SPEC.md` + `DESIGN.md`
- `docs/HLD.md` (Open Q2 — legacy Meetup API is dead/404)

**Prompt:**

```
Investigate how to acquire BrisJS past/upcoming events from Meetup in 2026:
1. Meetup GraphQL API (api.meetup.com/gql) — auth model (OAuth), whether a Meetup Pro account
   is required for our own group's events, and what fields are available.
2. Scraping meetup.com/brisjs/events/?type=past — check robots.txt + ToS, and whether the page
   exposes structured JSON.
Report a recommendation with trade-offs and draft an ADR for the chosen method. Do NOT scrape
in production without a ToS check.
```

**Expected output:** A viability report + a proposed ADR for the acquisition method.

---

## P-02: Enrichment importer

**Context files to load:**
- The decision from P-01
- `features/001-strapi-content-modeling/DESIGN.md` (Event/Talk model)
- `features/003-strapi-backend-integration` import tooling (reuse dedup utilities)

**Prompt:**

```
Build an idempotent enrichment importer (cms/scripts) per DESIGN.md using the chosen acquisition
method: fetch BrisJS events, normalise to feature-001 Event records, dedupe against existing CMS
content (by meetupEventId or date+title), and upsert only MISSING events as DRAFTS for review.
Best-effort extract Talks/Speakers from event descriptions, flagged for human review. Add a
meetupEventId/externalSource provenance field to Event if adopted (Open Design Q1). Never
overwrite or delete curated content. Include a dry-run report mode.
```

**Expected output:** A re-runnable enrichment importer + dry-run report; gated by TEST_CASES.md.
