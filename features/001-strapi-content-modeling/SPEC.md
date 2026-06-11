# Spec: Strapi Content Modeling

> **Status:** planning
> **Feature folder:** `features/001-strapi-content-modeling/`

## Overview

The current site sources content from four disconnected places: a Google Sheet (talks), the
Meetup API (events), GitHub issues (jobs + talk requests), and committed JSON files (speaker
Twitter cache + organizers). This feature defines a single, structured content model in
**Strapi** (per ADR-002) that replaces those sources, so all BrisJS content is created and
edited in one CMS with validation, relations, and media handling. It is the foundational
migration step — the frontend rebuild (ADR-003) and data migration depend on this model.

## Goals

- Define Strapi **collection types** and **single types** that cover every content kind the
  current site renders.
- Capture relations (talks ↔ speakers ↔ events) that the flat current sources only imply.
- Produce a source → content-type **migration mapping** so historical content can be imported.
- Validate the model against Strapi Cloud free-plan constraints before committing.

## Non-Goals

- Standing up the Strapi instance or writing the schema files (a later feature/step).
- Building the frontend that consumes the API (depends on ADR-003).
- Migrating live data (separate migration task; this defines the target shape only).
- Choosing the frontend framework (ADR-003, deliberately open).

## Functional Requirements

### FR-01: Talk content type

Model a talk with: `title`, `date`, `synopsis` (rich text), `youtubeUrl`, `slidesUrl`,
`codeUrl`, a relation to one or more **Speakers**, and a relation to the **Event** it was given at.

### FR-02: Speaker content type

Model a speaker with: `name`, `bio` (rich text), `photo` (media), `website`, and social handles
(e.g. `twitter`/X, replacing the deprecated Twitter cache). A speaker relates to many talks.

### FR-03: Event content type

Model a meetup event with: `name`, `dateTime`, `venue`, `description` (rich text), and a relation
to its **Talks**. This replaces the live Meetup API dependency for display purposes.

### FR-04: Job posting & Talk request content types

Model **Job posting** and **Talk request** entries, each with `title`, `body` (rich text),
`submittedDate`, and `status` — replacing the label-filtered GitHub issues.

### FR-05: Static single types

Model **Code of Conduct** and **Find Us / Venue** as single types holding rich-text/structured
content currently hard-coded in `index.html`.

### FR-06: Publication workflow

Every collection type supports Strapi's draft/publish so content can be staged before going live.

## Constraints

- Must fit within **Strapi Cloud free-plan** limits (entries, seats, bandwidth, API rate) —
  validate before finalising.
- Keep a clean self-host migration path (no Cloud-only features that block ADR-002's escape hatch).
- Field names should map cleanly from existing sources to ease data migration.
- No CMS credentials or tokens may end up in the frontend bundle.

## Success Criteria

- [ ] Every content kind the current site renders maps to a defined Strapi type.
- [ ] Talk ↔ Speaker ↔ Event relations are specified.
- [ ] A migration mapping table (old source → new type → field) exists in `DESIGN.md`.
- [ ] Strapi free-plan limits are confirmed sufficient (or risks recorded in Open Questions).
- [ ] The model is reviewed and ready to scaffold as Strapi content types.

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Should speakers be a full content type with login, or lightweight records managed by organizers? | — | — |
| 2 | Are historical talks (Google Sheet) imported in full, or only recent ones? | — | — |
| 3 | Do we keep pulling live Meetup data for the *next/upcoming* event, or manage events entirely in Strapi? | — | — |
| 4 | What are Strapi Cloud free-plan's exact limits, and are they sufficient for the talks archive size? | — | — |
| 5 | Is the Twitter/X handle still worth storing given API deprecation, or do we move to generic social links? | — | — |
