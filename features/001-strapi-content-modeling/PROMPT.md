# Prompts: Strapi Content Modeling

> Each section is a discrete, self-contained prompt to be fed to the agent.
> Run them in order unless noted otherwise. These assume a Strapi project has been (or is being)
> stood up; this feature's job is to translate the model in SPEC/DESIGN into Strapi schema.

---

## P-01: Scaffold Strapi content types

**Context files to load:**
- `features/001-strapi-content-modeling/SPEC.md`
- `features/001-strapi-content-modeling/DESIGN.md`
- `docs/DESIGN_DECISIONS.md` (ADR-002, ADR-003)

**Prompt:**

```
Create the Strapi content-type schemas defined in DESIGN.md for the BrisJS CMS:
collection types Talk, Speaker, Event, JobPosting, TalkRequest, and single types
CodeOfConduct and FindUs.

Requirements:
- Match the fields, types, and relations exactly as specified in DESIGN.md
  (Talk⇄Speaker many-to-many; Event→Talk one-to-many; Talk→Event many-to-one).
- Mark required fields (Talk.title, Talk.date, Speaker.name, Event.name, Event.dateTime,
  JobPosting.title/body, TalkRequest.title/body).
- Use Strapi's URL/enumeration/media/richtext field types appropriately.
- Enable draft & publish on all collection types.
- Add a `legacyId` field to Talk only if DESIGN Open Question 2 is resolved as "keep old URLs".
- Do not add fields not in DESIGN.md; record any proposed additions as DESIGN Open Questions.

Output the schema.json files under src/api/<type>/content-types/<type>/.
```

**Expected output:** Strapi `schema.json` files for all seven content types, matching DESIGN.md.

---

## P-02: Validate against free-plan limits & relations

**Context files to load:**
- The schema files produced in P-01
- `features/001-strapi-content-modeling/SPEC.md` (constraints, Open Questions)

**Prompt:**

```
Review the scaffolded content types against the SPEC constraints:
- Confirm relations resolve (no orphaned inverse relations).
- Estimate entry counts (historical talks + speakers) and check them against Strapi Cloud
  free-plan limits; record findings in SPEC Open Question 4.
- Confirm no admin-only or credential field is exposed on the public read API.
Report any mismatches and propose fixes.
```

**Expected output:** A short validation report + any schema corrections.

---

## P-03: Migration import mapping (later)

**Context files to load:**
- `features/001-strapi-content-modeling/DESIGN.md` (migration mapping table)
- `lib/tsvTalks.js`, `data/twitter.json`, `data/contact.json`

**Prompt:**

```
Using the migration mapping table in DESIGN.md, write an import script that reads the legacy
Google Sheet TSV (and data/twitter.json, data/contact.json) and creates Strapi entries via the
admin API. Coerce epoch-ms dates to dates, split CSV speakers into related Speaker records
(deduplicating by name), and tolerate missing optional fields. Run against a local Strapi first.
```

**Expected output:** An idempotent import script + a dry-run report of what it would create.
