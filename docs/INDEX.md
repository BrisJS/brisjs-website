# BrisJS — Architecture Documentation Index

> **Last updated:** 2026-06-11

This folder covers **system-wide** design and decisions. Feature-scoped design lives in
`features/NNN-<slug>/DESIGN.md`.

## When to Use Which Document

| Document | Use it when you need to… |
| -------- | ------------------------ |
| [`HLD.md`](./HLD.md) | Understand the overall system: major components, boundaries, and data flows |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Understand the design principles, patterns, and constraints that govern all decisions |
| [`DESIGN_DECISIONS.md`](./DESIGN_DECISIONS.md) | Record or review a key architectural decision, including alternatives and trade-offs |
| [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) | Reference the external data sources the site consumes today, and the planned Strapi API surface |
| [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) | Understand the test approach, pyramid, tooling, coverage thresholds, and CI gates |
| [`NON_FUNCTIONAL_TESTING.md`](./NON_FUNCTIONAL_TESTING.md) | Performance budgets, scalability targets, reliability scenarios, accessibility |
| [`BUILD_WORKFLOW.md`](./BUILD_WORKFLOW.md) | Execute the migration build — dependency-driven task board, gates, and the session protocol |

## Relationship to Feature Docs

```
docs/TEST_STRATEGY.md            ← how we test (tools, pyramid, quality gates)
docs/NON_FUNCTIONAL_TESTING.md   ← perf, scalability, reliability, a11y
features/NNN/REQUIREMENTS.md     ← acceptance criteria (EARS format)
features/NNN/TEST_CASES.md       ← explicit scenarios, test data, pass/fail
```

## Relationship to Architecture Docs

```
docs/HLD.md              ← system-wide "what" (components, boundaries)
docs/ARCHITECTURE.md     ← system-wide "why" (principles, constraints)
features/NNN/DESIGN.md   ← feature-level detail (design, data model, flows)
```

## Document Lifecycle

- **HLD** and **ARCHITECTURE** describe the **current** (pre-migration) system. They are
  updated when the system topology or principles actually change. Migration-target design is
  recorded as Proposed ADRs in `DESIGN_DECISIONS.md` and in feature folders until adopted.
- **DESIGN_DECISIONS** is append-only — never edit past entries, only add new ones.
- **API_SPECIFICATION** documents the external sources consumed today; the target Strapi API
  is filled in as content types are decided (see `features/001-strapi-content-modeling/`).
- **TEST_STRATEGY** is updated when tooling, coverage thresholds, or CI gates change.
- **NON_FUNCTIONAL_TESTING** is updated as performance budgets and targets are set or revised.
