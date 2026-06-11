# Overnight Goal — BrisJS Migration (autonomous run)

> **Purpose:** a self-contained prompt to drive an unattended build of the BrisJS migration
> against a **local backend**, following the project's doc system. Paste the "Prompt to run"
> block into an autonomous loop (e.g. `/ralph-loop`) or a long session with widened permissions.
>
> **Note:** there is no `/goal` command in this setup — use `/ralph-loop` (iterate until done)
> or `/loop`. The agent CANNOT create cloud accounts, tokens, or DNS, so the realistic target
> is "everything buildable locally + a clean human checklist for the cloud wiring."

## What it can do unattended
- Scaffold the **Astro app** (feature 002): structure, `src/lib/strapi`, `src/data/*`
  (porting `lib/tsvTalks.js` grouping), all pages/components — **porting the current
  `style.css`/Semantic-UI look as-is** (no redesign; that's feature 005).
- Stand up a **local Strapi** with the feature-001 content types **as code** (feature 003 P-01),
  including the new **Organizer** (collection) and **HomePage** (single type).
- Write + run the **legacy migration script** (feature 001 P-03) against *local* Strapi.
- Write **`netlify.toml`**, redirects, and the `#talk-<id>` client shim (feature 004 P-01).
- Tests per each feature's `TEST_CASES.md` + an `npm test` script.

## What needs a human (leave as HUMAN-TODO)
- Create the **Strapi Cloud** project + admin login; generate **API tokens**.
- Create/connect the **Netlify** project, set **env vars**, create the **build hook**.
- **DNS / domain** changes for `brisjs.org` and the stale `CNAME` (`bris.js.org`).
- Access to the **live** Google Sheet / Meetup / Twitter for real-data migration.

## Optional setup before the run (to get further)
- Provide `STRAPI_API_URL` + a read-only `STRAPI_API_TOKEN` and a Netlify build-hook URL as
  **env values** (never committed) — otherwise it targets local Strapi / mocked data.
- Confirm it may fetch the public talks TSV in `config.json`.
- Widen permissions (npm install, run `astro`/`strapi` dev, git) so it isn't prompted all night.

## Content/layout split (already decided)
Structure = Astro (header/nav, footer, page shells, hero, SEO/404). Content = Strapi (home
intro copy via `HomePage`, upcoming event, talks, talk detail, speakers, jobs, talk requests,
organizers/contact, Code of Conduct, Find Us). See
`features/002-astro-frontend/DESIGN.md` → Content & Rendering Map.

---

## Prompt to run

```
GOAL: Execute the BrisJS migration features end-to-end against a LOCAL backend, in order,
following the project's doc system. Read CLAUDE.md and docs/INDEX.md first.

Work through these in sequence, using each feature's PROMPT.md as the task script:
1. features/003-strapi-backend-integration P-01 — local Strapi with the feature-001 content
   types as code, INCLUDING Organizer (collection) and HomePage (single type). Then seed it
   with the legacy migration script (feature 001 P-03) run against LOCAL Strapi using the
   public Google Sheet TSV in config.json + data/twitter.json + data/contact.json (→ Organizer).
2. features/002-astro-frontend P-01..P-03 — scaffold the Astro app, data layer (port
   lib/tsvTalks.js grouping), all pages/components incl. the /contact page (organizers) and the
   home intro from HomePage, and tests. Honour the Content & Rendering Map in its DESIGN.md
   (structure = Astro, content = Strapi). PORT THE CURRENT DESIGN as-is (style.css + Semantic UI
   look; reference index.html + templates/talk.hbs). Do NOT redesign — feature 005 owns that.
3. features/004-netlify-deployment P-01..P-02 — netlify.toml, redirects, and the #talk-<id>
   client shim.

Do NOT start feature 005 (design refresh) — it is deliberately deferred.

Constraints:
- Use TDD per the test-driven-development skill; keep each feature's TEST_CASES.md green.
- Read STRAPI_API_URL/STRAPI_API_TOKEN from env; never commit secrets. If cloud creds are
  absent, target local Strapi / mocked data and DO NOT block on cloud signups.
- Commit after each feature with a clear message. Update each feature's status in
  features/FEATURES.md as you complete it. Record any blocker in that feature's Open Questions
  instead of guessing.
- STOP and write a HUMAN-TODO note (e.g. docs/HUMAN_TODO.md) for everything requiring accounts,
  tokens, DNS, or the live domain — do not attempt Strapi Cloud / Netlify account actions.

Verify at the end: `npm run build` (Astro) succeeds against local Strapi, tests pass, and the
home/talks/talk-detail pages visually match the current site.
```
