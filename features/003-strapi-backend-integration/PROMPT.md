# Prompts: Strapi Backend Integration

> Each section is a discrete, self-contained prompt. Run in order. Depends on feature 001
> (content types) and coordinates with feature 004 (Netlify build hook).

---

## P-01: Stand up Strapi + deploy content types

**Context files to load:**
- `features/003-strapi-backend-integration/SPEC.md`
- `features/003-strapi-backend-integration/DESIGN.md`
- `features/001-strapi-content-modeling/DESIGN.md` + its `PROMPT.md` (P-01 schemas)
- `docs/DESIGN_DECISIONS.md` (ADR-002, ADR-005)

**Prompt:**

```
Create a local Strapi project (schema in code) containing the feature-001 content types, ready
to deploy to Strapi Cloud (free plan). Enable draft & publish on all collection types. Add
config for CORS allowing the Astro site/build origin. Do not commit any secrets. Document the
exact Strapi Cloud project steps (create project, link repo/deploy, set admin) in this feature
folder as you go.
```

**Expected output:** A Strapi project with feature-001 types, deployable to Strapi Cloud.

---

## P-02: Permissions, token, and publish webhook

**Context files to load:**
- The Strapi project from P-01
- `features/003-strapi-backend-integration/DESIGN.md` (roles/tokens/webhook)
- `features/004-netlify-deployment/DESIGN.md` (build hook URL)

**Prompt:**

```
Configure the Public role to allow find/findOne on the public content types and deny all
writes. Create a READ-ONLY API token for the Astro build. Add a Strapi webhook on
publish/update/unpublish/delete of public types that calls the Netlify build hook URL from
feature 004. Record STRAPI_API_URL and STRAPI_API_TOKEN as values to be set in Netlify env
(feature 004) — do not hardcode them. Verify published-only reads and denied writes.
```

**Expected output:** Locked-down public API, a read-only build token, and a working publish→rebuild webhook.

---

## P-03: Migrate legacy content

**Context files to load:**
- `features/001-strapi-content-modeling/DESIGN.md` (migration mapping) + `PROMPT.md` P-03
- `lib/tsvTalks.js`, `data/twitter.json`, `data/contact.json`, `config.json`

**Prompt:**

```
Implement and run the idempotent legacy importer described in feature 001 P-03 against the
Strapi instance: read the Google Sheet TSV (config.json dataSources.talks), data/twitter.json,
and data/contact.json; create Talk/Speaker/Event/Organizer entries per the feature-001 mapping;
coerce epoch-ms dates, split CSV speakers, dedupe speakers by name; upsert by a stable key so
re-runs create no duplicates. Produce a dry-run report first, then run, then spot-check a few
talks against the live old site.
```

**Expected output:** Migrated content in Strapi + a dry-run/diff report; re-runnable safely.
