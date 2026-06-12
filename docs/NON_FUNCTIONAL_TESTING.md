# Non-Functional Testing: BrisJS Website

> **Last updated:** 2026-06-11
> **Status:** targets are intent, not yet measured. Current baseline numbers are unmeasured —
> they go in Open Questions until captured.

## Scope

Cross-cutting quality attributes: performance, scalability, reliability, accessibility,
security. Functional test cases live per-feature in `features/NNN/TEST_CASES.md`.

---

## Performance

| Metric | Target | Measurement |
| ------ | ------ | ----------- |
| Lighthouse Performance | ≥ 90 (target for the rebuild) | Lighthouse (Chrome DevTools / CI) |
| Largest Contentful Paint | < 2.5s on 4G | Lighthouse / Web Vitals |
| Total JS shipped | Smaller than current (`app.min.js` ≈ 559 KB today) | bundle analysis |

> Current site is client-rendered and waits on several external fetches before content
> appears — see Open Questions for the unmeasured baseline.

## Scalability

| Concern | Threshold to test | Approach |
| ------- | ----------------- | -------- |
| Static traffic | Handle launch/spike traffic | CDN-served static assets (Netlify) |
| Talks archive growth | Years of talks without slow load | CMS pagination / build-time generation instead of fetching the whole archive client-side |
| Strapi free-tier limits | Stay within entries/bandwidth/rate caps | Validate Strapi Cloud free-plan quotas (tracked in feature 001) |

## Reliability

| Scenario | Expected outcome | Test type |
| -------- | ---------------- | --------- |
| A content source / CMS is unavailable | Page degrades gracefully, no blank screen | E2E (failure path) |
| Malformed content entry | Skipped/handled, doesn't break the page | Unit/integration |
| Deploy of bad build | Previous deploy remains live; easy rollback | Netlify deploy history |

## Accessibility

| Standard | Target |
| -------- | ------ |
| WCAG 2.1 | AA (intent for the rebuild) |
| Keyboard navigation | All interactive elements reachable and operable |
| Color contrast | Meets AA contrast ratios |

## Security (non-functional surface)

| Area | Requirement |
| ---- | ----------- |
| Secrets | No API tokens/keys in the client bundle; CMS credentials stay server-side |
| Transport | HTTPS only (site + CMS API) |
| Content injection | Sanitise/escape CMS rich-text and any markdown rendering |
| Dependencies | Remove unmaintained/deprecated packages (see ARCHITECTURE Dependency Risk) |

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | What is the current site's measured Lighthouse / Web Vitals baseline (so we can show improvement)? | — | Partially resolved 2026-06-12 (`docs/baseline/`): home a11y **48**, best-practices 96, SEO 82. Performance score still pending a perf trace |
| 2 | What are Strapi Cloud free-plan's exact limits (entries, seats, bandwidth, API rate)? | — | — |
| 3 | What accessibility issues exist in the current site today (audit not yet run)? | — | — |
