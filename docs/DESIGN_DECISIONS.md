# Design Decisions: BrisJS Website

> **Last updated:** 2026-06-11
>
> This is an **append-only** log. Never edit or delete past entries — only add new ones.
> Format each entry as an ADR (Architecture Decision Record). To change a past decision, add
> a new ADR and mark the old one `Superseded by ADR-NNN`.

---

## ADR-001: Adopt a two-tier in-repo documentation system

**Date:** 2026-06-11
**Status:** Accepted

### Context

The site is ~9 years old, was built by a previous maintainer, and has almost no
documentation. We are starting a significant migration (toward a CMS-backed architecture and
a design refresh) and need a durable, low-friction way to capture system understanding,
decisions, and feature plans alongside the code — so the migration analysis lives in version
control rather than in scattered notes.

### Decision

Adopt the two-tier markdown documentation system specified in
[`DOC_SYSTEM_HANDOFF.md`](./DOC_SYSTEM_HANDOFF.md): system-wide docs in `docs/` (INDEX, HLD,
ARCHITECTURE, DESIGN_DECISIONS, API_SPECIFICATION, TEST_STRATEGY, NON_FUNCTIONAL_TESTING) and
feature-scoped docs in `features/NNN-<slug>/` scaffolded from `features/_template/`. Use ADRs
for decisions, EARS for requirements, and referenceable IDs (`FR-/US-/TC-/ADR-/P-`).

### Alternatives Considered

| Alternative | Reason Rejected |
| ----------- | --------------- |
| GitHub wiki | Lives outside the repo; not versioned with code; easy to drift |
| Ad-hoc `README` notes | No structure, no decision history, doesn't scale across the migration |
| Issues/project board only | Good for tasks, poor for durable design rationale |

### Consequences

- ✅ Migration planning is versioned, reviewable, and cross-linked to the code.
- ✅ A repeatable feature workflow (`_template/`) keeps every feature documented identically.
- ⚠️ Requires ongoing discipline to keep docs in sync with reality (lifecycle rules in `INDEX.md`).

---

## ADR-002: Migrate to a CMS-backed architecture with Strapi Cloud

**Date:** 2026-06-11
**Status:** Proposed

### Context

The current site has no backend: content is scattered across a Google Sheet (talks), the
Meetup API (events), GitHub issues (jobs/talk requests), and committed JSON (speakers,
organizers). Several of these sources are fragile (deprecated Twitter API, opaque Meetup
signature, single-owner sheet) and editing content is inconsistent and contributor-hostile.
We want a single, structured, editor-friendly content store, while keeping hosting simple and
costs at zero to start.

### Decision

Target a **CMS-backed architecture** with **Strapi Cloud (free plan)** as the backend, with a
future option to **self-host** Strapi if/when the free plan's limits or data-ownership needs
require it. Content currently spread across external sources is modelled as Strapi content
types (see [`features/001-strapi-content-modeling`](../features/001-strapi-content-modeling/)).

### Alternatives Considered

| Alternative | Reason Rejected (for now) |
| ----------- | ------------------------- |
| Stay fully static, keep external sources | Doesn't fix fragility or editor experience; defers the real problem |
| Keep Google Sheet as the CMS | Single-owner, no schema/validation, no media handling, weak workflow |
| Contentful / Sanity (hosted SaaS) | Viable, but Strapi keeps an open-source self-host escape hatch and avoids per-seat/usage pricing concerns |
| Self-host Strapi from day one | More ops burden up front; free Cloud plan lets us validate the model first |

### Consequences

- ✅ Single structured content store with a real editing UI and media library.
- ✅ Open-source core preserves a self-host migration path (no hard vendor lock-in).
- ⚠️ Introduces a backend to operate and a hosting dependency on Strapi Cloud's free tier.
- ⚠️ Free-tier limits (entries, seats, bandwidth, API rate) need validation; record findings
  in `features/001` Open Questions before committing.
- ⚠️ Requires a one-time data migration of historical talks/speakers from existing sources.

---

## ADR-003: Frontend framework for the rebuild

**Date:** 2026-06-11
**Status:** Proposed (undecided — evaluation open)

### Context

If we adopt a CMS backend (ADR-002), the current Browserify + client-side-Handlebars frontend
will be rebuilt to consume the CMS API. The framework choice affects rendering strategy
(SSG/SSR vs CSR), SEO, performance, build tooling, and the test strategy. The decision is not
yet made and should not block standing up the CMS and modelling content.

### Decision

**Deferred.** The frontend framework is explicitly left open and recorded as an Open Question.
Leading candidates to evaluate: **Astro** (static-first, content-driven), **Next.js** and
**Nuxt** (full React/Vue frameworks), or a **modernised version of the current** client-side
approach. A follow-up ADR will record the chosen framework with rationale.

### Alternatives Considered

| Alternative | Notes (to be evaluated, not yet decided) |
| ----------- | ---------------------------------------- |
| Astro | Static-first, great for a content site; ships minimal JS; first candidate to assess |
| Next.js | Powerful, large ecosystem; heavier than needed for a brochure/meetup site |
| Nuxt | Vue equivalent of Next; same trade-off |
| Modernise current SPA | Lowest migration cost, but keeps CSR's SEO/perf limits |

### Consequences

- ✅ Avoids prematurely committing to a stack before content modelling is validated.
- ⚠️ Some downstream docs (TEST_STRATEGY tool choices, rendering-related NFRs) stay TBD until
  this is resolved.

---

<!-- New ADRs go below this line, following the same format -->
