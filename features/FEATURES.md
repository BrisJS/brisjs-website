# BrisJS — Feature Index

Each feature lives in its own numbered folder under `features/`. Copy `_template/` to start a new feature.

## Folder Naming Convention

```
features/<NNN>-<kebab-case-name>/
```

- `NNN` — zero-padded three-digit sequence number (e.g. `001`, `042`)
- `<kebab-case-name>` — short, descriptive slug matching the feature title

## Files per Feature

| File | Purpose |
| ---- | ------- |
| `SPEC.md` | Technical requirements, behaviors, constraints, and success criteria |
| `REQUIREMENTS.md` | User stories and acceptance criteria (EARS format) |
| `DESIGN.md` | Architecture, data models, system interactions, diagrams |
| `TEST_CASES.md` | Explicit test scenarios, test data, and pass/fail criteria |
| `PROMPT.md` | Pre-written agent prompts for code generation within the feature |

## Status Legend

| Status | Meaning |
| ------ | ------- |
| `planning` | Requirements and design being defined |
| `ready` | Spec complete, ready to implement |
| `active` | Currently in development |
| `complete` | Shipped and merged |
| `paused` | Deferred or blocked |

---

## Feature Index

| # | Feature | Status | Folder |
| - | ------- | ------ | ------ |
| 001 | Strapi content modeling | active | [`features/001-strapi-content-modeling/`](./001-strapi-content-modeling/) |
| 002 | Astro frontend (port current design) | active | [`features/002-astro-frontend/`](./002-astro-frontend/) |
| 003 | Strapi backend integration | active | [`features/003-strapi-backend-integration/`](./003-strapi-backend-integration/) |
| 004 | Netlify deployment & hosting | active | [`features/004-netlify-deployment/`](./004-netlify-deployment/) |
| 005 | Design refresh (post-migration redesign) | planning | [`features/005-design-refresh/`](./005-design-refresh/) |
| 006 | Meetup past-events enrichment (backlog) | planning | [`features/006-meetup-events-enrichment/`](./006-meetup-events-enrichment/) |
