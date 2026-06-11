# Test Strategy: BrisJS Website

> **Last updated:** 2026-06-11
> **Current state:** the project has **no tests and no CI quality gates** (the `package.json`
> `test` script is a placeholder that exits 1). This document defines the test approach for
> the migration/rebuild. Tooling is now pinned following the Astro adoption (ADR-004) and
> repo layout (ADR-006): **Vitest, Playwright, TypeScript, ESLint + Prettier, GitHub Actions**.

## Test Pyramid

```
        ▲
       /E2E\          Playwright — critical user journeys only
      /──────\
     /Integr- \       Vitest — content fetching from Strapi (local/mocked), render integration
    /──────────\
   /  Unit Tests \    Vitest — pure transforms (talk parsing/grouping in web/src/data)
  /──────────────\
```

| Layer | Tool | Scope | Target Coverage |
| ----- | ---- | ----- | --------------- |
| Unit | Vitest | pure functions / data transforms (talk parsing, grouping, date formatting) | High — ≥ 80% on transform/business logic |
| Integration | Vitest (against local Strapi or mocked fetch) | Strapi API → view-model mapping, build-output checks | Medium — key integration points |
| E2E | Playwright | complete journeys in a real browser | Low — happy paths + critical failures |

## Tooling

| Tool | Purpose |
| ---- | ------- |
| Vitest | Unit + integration tests; coverage reporting |
| Playwright | Browser-level journey tests in CI (headless) |
| TypeScript | Static type checking (`astro check` / `tsc --noEmit`) as a merge gate |
| ESLint + Prettier | Style + static checks as a merge gate |
| GitHub Actions | CI running the gates on PRs (created during the build — see `docs/BUILD_WORKFLOW.md` T0.4) |

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
- [ ] No TypeScript errors
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
