# cms/ — BrisJS Strapi project

The Strapi CMS for BrisJS (features `001-strapi-content-modeling` +
`003-strapi-backend-integration`). Schema is defined **as code** under `src/api/`;
this folder deploys to Strapi Cloud later (ADR-002/ADR-005/ADR-006). See
`docs/BUILD_WORKFLOW.md` (T1.x).

- **Strapi version:** 5.48.0 (Community)
- **Database:** SQLite (quickstart) — file at `.tmp/data.db`, no external services needed.

## Requirements

Strapi 5.48 requires **Node.js `>=20 <=24`**. This repo's default Node may be newer
(e.g. 26), which Strapi refuses to start under. Use Node 22 LTS, e.g. with nvm:

```bash
nvm install 22 && nvm use 22
```

## Run locally

```bash
cd cms
npm install            # first time only
npm run develop        # dev server with auto-reload at http://localhost:1337
```

On first run, open **http://localhost:1337/admin** and create the first administrator
account (local only — not committed). The admin panel is where organizers create/edit
content. The public REST API is served from `http://localhost:1337/api/...`.

Other scripts:

```bash
npm run build          # build the admin panel (CI / pre-deploy)
npm start              # run without watch mode
```

## Content types (feature 001)

Defined as code under `src/api/<type>/content-types/<type>/schema.json`.

**Collection types** (all have draft & publish enabled):

| Type | Key fields | Relations |
| ---- | ---------- | --------- |
| `Talk` | `title` (req), `slug` (uid←title, req), `legacyId` (unique int), `date` (req), `synopsis`, `youtubeUrl`, `slidesUrl`, `codeUrl` | `speakers` many-to-many Speaker; `event` many-to-one Event |
| `Speaker` | `name` (req), `bio`, `photo` (media), `website`, `twitter` | `talks` (inverse of Talk.speakers) |
| `Event` | `name` (req), `dateTime` (req), `venue`, `description` | `talks` one-to-many Talk |
| `JobPosting` | `title` (req), `body` (req), `submittedDate`, `status` (open/filled/closed) | — |
| `TalkRequest` | `title` (req), `body` (req), `submittedDate`, `status` (open/scheduled/declined) | — |
| `Organizer` | `name` (req), `role`, `bio`, `photo` (media), `twitter`, `email`, `order` | — |

**Single types:**

| Type | Key fields |
| ---- | ---------- |
| `HomePage` | `heroTagline`, `intro`, `whatWeDo` |
| `CodeOfConduct` | `body` (req) |
| `FindUs` | `venueName`, `address`, `mapEmbed`, `parking`, `accessibility` |

> **URL fields** (`youtubeUrl`, `slidesUrl`, `codeUrl`, `website`) are typed `string`.
> Strapi 5 has no built-in `url` attribute type; add a regex validator or validate at
> the importer/frontend if strict URL validation is needed (feature 001 TC-03).

## Public-role permissions (read-only)

Enforced **in code** by the bootstrap in `src/index.js`, which runs on every boot:

- Grants the Public (unauthenticated) role `find` + `findOne` on the collection types
  and `find` on the single types.
- Explicitly **denies** `create` / `update` / `delete` for the Public role.

Verified locally: public `GET /api/talks` → `200`; public `POST`/`PUT`/`DELETE` → `403`.
Because draft & publish is on, the public API returns **published** entries only (drafts
are excluded).

## Legacy data importer (feature 003 / T1.2)

`scripts/import-legacy.js` seeds the LOCAL Strapi DB from the legacy data sources
(`data/legacy/talks.tsv`, `data/twitter.json`, `data/contact.json`, plus static copy
transcribed from `index.html`), following the Migration Mapping in
`features/001-strapi-content-modeling/DESIGN.md`. It bootstraps a full Strapi instance and
writes through the document service (`strapi.documents(...)`), then **publishes** every entry
so it is visible on the public read-only API.

```bash
cd cms
nvm use 22                       # Strapi requires Node 20-24
npm run import:legacy:dry        # report what would be created/updated, no writes
npm run import:legacy            # write + publish to .tmp/data.db
```

**Idempotent** — every entry upserts on a stable natural key (Talk → `legacyId`,
Speaker → `name`, Event → `dateTime`, Organizer → `name`; single types are find-or-create),
so a second run creates **no duplicates** (it only updates existing rows).

What it imports (from a clean DB): **227 talks, 120 speakers, 80 events, 1 organizer,
3 single types** (HomePage, CodeOfConduct, FindUs).

Notes / manual follow-ups:

- `Speaker.photo` and `Organizer.photo` are Strapi **media** fields; the legacy data only has
  image URLs, which can't be set without an upload step. Bios/websites/twitter handles are
  imported; **photos need manual upload** in the admin.
- `FindUs.mapEmbed` is left empty — `index.html` uses a static SVG, not an embeddable map.
- The legacy sheet reuses a few `legacyId`s across different talks (189, 206, 207, 208). The
  importer keeps the first occurrence's original id (so `#talk-<id>` redirects resolve) and
  assigns deterministic synthetic ids to the later collisions, so no talks are lost.
- `Talk.slug` is derived in the script (`slugify(title)-legacyId`) because the core document
  service does not auto-populate `uid` fields the way the admin content-manager does.

## What's NOT in this task

- Strapi Cloud deploy, API tokens, CORS, publish webhooks → later cloud tasks
  (feature 003 / 004). Schema, Public-role permissions, and the local legacy importer are the
  scope of T1.1 + T1.2.
