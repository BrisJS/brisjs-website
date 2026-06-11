# Prompts: Netlify Deployment & Hosting

> Each section is a discrete, self-contained prompt. Run in order. Depends on feature 002
> (Astro build) and coordinates with feature 003 (Strapi webhook ↔ build hook).

---

## P-01: Build config + environment

**Context files to load:**
- `features/004-netlify-deployment/SPEC.md`
- `features/004-netlify-deployment/DESIGN.md`
- `features/002-astro-frontend/DESIGN.md` (build command, env var names)
- `docs/DESIGN_DECISIONS.md` (ADR-005)

**Prompt:**

```
Add a netlify.toml at the repo root per DESIGN.md: build command `npm run build` (astro build),
publish dir `dist`, pinned Node LTS. Document (do not hardcode) that STRAPI_API_URL and
STRAPI_API_TOKEN are set in the Netlify UI environment, consumed by the Astro data layer.
Ensure no secret is committed. Confirm the site builds on Netlify from a push to the default branch.
```

**Expected output:** `netlify.toml` + documented env setup; push-to-deploy working.

---

## P-02: Build hook, redirects, domain

**Context files to load:**
- The config from P-01
- `features/003-strapi-backend-integration/DESIGN.md` (webhook)
- `features/002-astro-frontend/DESIGN.md` (talk slug / legacyId)

**Prompt:**

```
1. Create a Netlify build hook and provide its URL to feature 003's Strapi webhook.
2. Add legacy redirects: netlify.toml [[redirects]] for any old path URLs, and a small
   client-side shim that maps `#talk-<id>` to the new /talks/<slug> route (using legacyId),
   falling back to /talks for unknown ids.
3. Configure the custom domain brisjs.org with automatic HTTPS, reconcile the repo CNAME
   (currently bris.js.org) and DNS so there's one canonical host. Resolve docs/HLD.md Open Q1.
Document each step in this feature folder.
```

**Expected output:** Auto-rebuild on publish, working legacy redirects, and `brisjs.org` on HTTPS.

---

## P-03: Verify deploy + previews

**Context files to load:**
- `features/004-netlify-deployment/TEST_CASES.md`

**Prompt:**

```
Verify the deployment per TEST_CASES.md: push-deploy (TC-01), publish→rebuild (TC-02),
fail-safe build with broken env (TC-03), legacy hash redirect known/unknown (TC-04),
canonical HTTPS domain (TC-05), no committed secrets (TC-06), and PR deploy previews (TC-07).
Record results and any follow-ups in this feature folder.
```

**Expected output:** A verification report against TEST_CASES, with previews enabled.
