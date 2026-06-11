# Architecture: BrisJS Website

> **Last updated:** 2026-06-11
> **Scope:** Describes the **current** architecture (principles, patterns, constraints, and
> risks as they exist today). Migration-target principles will be recorded here only once
> adopted; until then they live as Proposed ADRs in [`DESIGN_DECISIONS.md`](./DESIGN_DECISIONS.md).

## Guiding Principles (as built today)

1. **Zero owned backend** — the site is static; no server logic, no database. All dynamic
   content is delegated to third-party systems.
2. **Externalised content** — talks live in a Google Sheet, events in Meetup, jobs and talk
   requests in GitHub issues, speaker/organizer data in committed JSON. Content editing
   never requires a code change.
3. **Static hosting, push-to-deploy** — a commit to `master` is the entire release process;
   Netlify serves the built bundle.
4. **Client-side everything** — routing, data fetching, and rendering all happen in the
   browser via a single Browserify bundle.

## Architectural Patterns

### Hash-based client routing

`window.location.hash` drives which `[data-page]` section is visible. `hashChange()` toggles
display and special-cases `#talk-<id>` to render the single-talk Handlebars template. No
server routes, no history API.

### Runtime template compilation

Handlebars templates are compiled in the browser at load time: the single-talk template via
`hbsfy` (bundled), and the archive/jobs/contact/requested-talks templates from inline
`<script type="text/x-handlebars-template">` blocks in `index.html` (`templateContent()`).

### GitHub issues as a lightweight CMS

Jobs and talk requests are GitHub issues in `brisjs/meetups`, filtered client-side by label
(`Jobs / Employment`, `Talk Requests`) and rendered through `markdown-it`. The issue tracker
doubles as a moderation queue and content store.

## Scalability Considerations

| Concern | Approach (today) |
| ------- | ---------------- |
| Traffic | Static assets on a CDN (Netlify) — scales trivially |
| Content volume | Talks archive is a single growing TSV fetched whole on each load; fine at current scale, unbounded over time |
| Editor concurrency | None handled — content is edited directly in source systems with no workflow |

## Constraints

- **Client-only rendering** — no SSR/SSG, so first paint waits on JS execution and multiple
  external fetches; SEO and social-preview metadata are limited to what's static in
  `index.html`.
- **Third-party API availability** — an outage or breaking change at Meetup, Google Sheets,
  GitHub, or Twitter directly degrades the live site.
- **No build-time validation** — malformed sheet rows or API shape changes surface only as
  runtime errors in users' browsers.

## Dependency Risk

| Dependency | Risk | Mitigation |
| ---------- | ---- | ---------- |
| `browserify` ^14 + `beefy` ^2 | ~9-year-old build chain, effectively unmaintained | Replace as part of the rebuild (tooling decision tied to ADR-003) |
| `uglify-es` ^3 | Deprecated (superseded by `terser`) | Replace during tooling modernisation |
| `fetch-jsonp` ^1 | JSONP is an outdated, security-sensitive transport (used for Meetup) | Move to a server/CMS-mediated fetch; remove JSONP |
| `twitter` ^1 + Twitter API v1 | API deprecated; `tools/build-twitter` likely no longer works | Replace speaker profiles with CMS-managed fields (see feature 001) |
| `date-fns` ^1 | Several majors behind (current v3+) | Upgrade during rebuild |
| Meetup `sig` URL | Embedded signature may expire; opaque ownership | Track in HLD Open Questions; move to authenticated server-side fetch |
| Google Sheet (talks) | Single-owner source of truth, no versioning/validation | Migrate to CMS content type (feature 001) |
