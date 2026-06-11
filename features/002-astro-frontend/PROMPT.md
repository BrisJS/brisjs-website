# Prompts: Astro Frontend

> Each section is a discrete, self-contained prompt to be fed to the agent.
> Run them in order. Depends on feature 001 (content types) and ideally a reachable Strapi
> (feature 003) or a mocked API for local builds.

---

## P-01: Scaffold the Astro project + Strapi data layer

**Context files to load:**
- `features/002-astro-frontend/SPEC.md`
- `features/002-astro-frontend/DESIGN.md`
- `features/001-strapi-content-modeling/DESIGN.md` (content types + API)
- `docs/DESIGN_DECISIONS.md` (ADR-002, ADR-004, ADR-005)

**Prompt:**

```
Scaffold an Astro project for the BrisJS site per DESIGN.md.
- Create the src/ structure shown in DESIGN.md (lib/strapi, data/*, layouts, components, pages, styles).
- Implement src/lib/strapi with a fetch wrapper reading STRAPI_API_URL and STRAPI_API_TOKEN
  from environment variables; never hardcode secrets.
- Implement src/data/talks with getTalks(), getTalkBySlug(), and groupByEvent() — port the
  grouping/parsing semantics from the legacy lib/tsvTalks.js (getTalksByMeetup, parseYoutube).
- All content is fetched at BUILD time (SSG). Do not call Strapi from the browser.
- Generate /talks/[slug] via getStaticPaths.
Follow CLAUDE.md conventions. Output a working `astro build` against a mocked or local Strapi.
```

**Expected output:** A buildable Astro project with the data layer and page routes.

---

## P-02: Pages, components, and design refresh

**Context files to load:**
- The scaffold from P-01
- `features/002-astro-frontend/REQUIREMENTS.md` (page set, metadata)

**Prompt:**

```
Implement all pages from FR-01 (home + upcoming event, talks archive grouped by event,
talk detail, jobs, talk requests, code of conduct, find us) using the data layer from P-01.
Build the components (TalkCard, SpeakerCard, EventBanner, ResourceButtons) and a BaseLayout
with per-page title/description and Open Graph/Twitter metadata.
PORT THE CURRENT DESIGN as faithfully as reasonable: carry over the existing style.css and the
Semantic-UI-based look (reference index.html + templates/talk.hbs for the current markup), and
re-express it through the Astro components/layouts. Do NOT redesign — visual parity with the
current site is the goal; a redesign is a separate future feature. Keep it responsive and
keyboard-accessible. Render missing optional fields gracefully (mirror templates/talk.hbs).
```

**Expected output:** All page types rendering from Strapi data with a cohesive responsive design.

---

## P-03: Tests

**Context files to load:**
- `features/002-astro-frontend/TEST_CASES.md`
- The code from P-01/P-02

**Prompt:**

```
Add tests per TEST_CASES.md:
- Unit tests for src/data grouping/parsing (TC-04) using fixtures.
- An integration check that the build produces talk detail pages and omits missing resources (TC-02/03).
- A security check that no Strapi token leaks into dist/ (TC-05).
- A build-failure check when Strapi is unreachable (TC-06).
Use the tooling chosen in docs/TEST_STRATEGY.md (e.g. Vitest + Playwright). Wire an npm test script.
```

**Expected output:** Passing unit + integration tests and a `test` script.
