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
GOAL: Build the BrisJS migration by executing the task board in docs/BUILD_WORKFLOW.md.
Read CLAUDE.md, docs/INDEX.md, and docs/BUILD_WORKFLOW.md first — the board is the single
source of truth for ordering, dependencies, and done-criteria.

Each iteration, follow the workflow protocol exactly:
1. Read the board; pick the highest-priority `Owner: agent` task whose dependencies are done.
2. If several independent tasks are ready, dispatch parallel subagents (max 3), each with a
   self-contained prompt naming the relevant feature docs and the task's gate.
3. Implement with TDD; the task is done only when its gate (referenced TEST_CASES) is green.
4. One commit per task, message prefixed with the task ID. Update the board status and
   features/FEATURES.md as features complete.
5. If blocked: mark the task blocked with a reason on the board, log detail in the owning
   feature's Open Questions, and move to the next ready task.

Stop when all agent-owned tasks are done or blocked, then write docs/HUMAN_TODO.md
summarising the Phase 4 human checklist (cloud accounts, tokens, env, webhook, DNS).

Hard rules (also in the workflow doc):
- Never start feature 005 (design refresh); never attempt Strapi Cloud / Netlify account
  actions or DNS changes.
- Read STRAPI_API_URL/STRAPI_API_TOKEN from env; never commit secrets. Without cloud creds,
  target local Strapi / snapshot data only — do not block on cloud signups.
- PORT THE CURRENT DESIGN as-is (style.css + Semantic UI; reference index.html +
  templates/talk.hbs). Visual parity with the T0.2 baseline screenshots is the bar.

Verify at the end (workflow's Verification section): cms/ starts locally with seeded content,
`npm run build` in web/ succeeds against it, all gates are green, and home/talks/talk-detail
visually match the baseline.
```
