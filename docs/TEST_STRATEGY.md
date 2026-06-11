# Test Strategy: BrisJS Website

> **Last updated:** 2026-06-11
> **Current state:** the project has **no tests and no CI quality gates** (the `package.json`
> `test` script is a placeholder that exits 1). This document defines the **intended** test
> approach for the migration/rebuild. Concrete tool choices marked TBD depend on the frontend
> framework decision (ADR-003).

## Test Pyramid (intended)

```
        ▲
       /E2E\          TBD (Playwright/Cypress) — critical user journeys only
      /──────\
     /Integr- \       TBD — content fetching from Strapi, render integration
    /──────────\
   /  Unit Tests \    TBD (Vitest/Jest) — pure transforms (e.g. tsvTalks-style parsing)
  /──────────────\
```

| Layer | Tool | Scope | Target Coverage |
| ----- | ---- | ----- | --------------- |
| Unit | TBD (Vitest or Jest) | pure functions / data transforms (talk parsing, grouping, date formatting) | High — ≥ 80% on transform/business logic |
| Integration | TBD | content fetching from the Strapi API, mapping API → view models | Medium — key integration points |
| E2E | TBD (Playwright or Cypress) | complete journeys in a real browser | Low — happy paths + critical failures |

## Tooling

| Tool | Purpose |
| ---- | ------- |
| TBD unit runner | Run unit/integration tests; coverage reporting |
| TBD E2E runner | Browser-level journey tests in CI (headless) |
| Linter/formatter (TBD, e.g. ESLint + Prettier) | Style + static checks as a merge gate |
| GitHub Actions (intended) | CI to run the gates on PRs (none configured today) |

## What to Test at Each Layer

### Unit Tests
- Data transforms equivalent to today's `lib/tsvTalks.js` (parsing, speaker/YouTube parsing, grouping by meetup).
- Any CMS response → view-model mapping logic.
- Date/format helpers.

### Integration Tests
- Fetching and shaping content from the Strapi API (mocked and/or against a local Strapi).
- Label/category filtering for jobs and talk requests.

### E2E Tests
- Home loads and shows the next event.
- Talks archive renders; opening a single talk shows speaker(s) + video/slides/code links.
- Jobs and talk-request pages render content from the CMS.

## Quality Gates

These must pass before merging to the main branch (intended bar — not yet enforced):

- [ ] All unit and integration tests pass
- [ ] No type errors (if a typed stack is chosen)
- [ ] Formatting/lint passes
- [ ] E2E tests pass on CI for affected journeys

## Coverage

- Measured on unit + integration tests only.
- Minimum threshold: **80%** on content-transform / data-mapping modules (target).

## Test File Conventions (intended)

| Test type | Location | File naming |
| --------- | -------- | ----------- |
| Unit | Co-located with source | `<module>.test.<ext>` |
| Integration | `<dir>/__tests__/` | `<module>.integration.test.<ext>` |
| E2E | `e2e/` | `<journey>.spec.<ext>` |

## CI Pipeline (intended)

```
push / PR
  └── lint + typecheck
  └── unit + integration tests
  └── E2E tests (headless)
  └── build
```

## Out of Scope

- Testing the current Browserify SPA — it will be replaced rather than retrofitted with tests.
- Testing third-party services themselves (Meetup, GitHub, Strapi internals).
