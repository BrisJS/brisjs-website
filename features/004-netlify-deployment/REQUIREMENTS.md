# Requirements: Netlify Deployment & Hosting

> EARS format — Easy Approach to Requirements Syntax
> Patterns: **Ubiquitous** | **Event-driven** | **Unwanted behaviour** | **State-driven** | **Optional**

## User Stories

### US-01: Maintainer deploys by pushing

**As a** maintainer,
**I want** Netlify to build and deploy the Astro site when I push to the default branch,
**So that** releasing is just a commit, as it is today.

#### Acceptance Criteria

- **WHEN** a commit lands on the default branch, **THE SYSTEM SHALL** run the Astro build and publish `dist/`.
- **IF** the build fails (e.g. Strapi unreachable), **THEN THE SYSTEM SHALL** keep the previous deploy live.

---

### US-02: Content publish redeploys the site

**As a** BrisJS organizer,
**I want** publishing in Strapi to rebuild the site,
**So that** content changes appear without a code push.

#### Acceptance Criteria

- **WHEN** the Strapi webhook calls the Netlify build hook, **THE SYSTEM SHALL** trigger a rebuild/redeploy.

---

### US-03: Visitors reach the site at the canonical domain

**As a** visitor,
**I want to** reach the site at `brisjs.org` over HTTPS,
**So that** links work and the connection is secure.

#### Acceptance Criteria

- **THE SYSTEM SHALL** serve the site at `brisjs.org` with automatic HTTPS.
- **THE SYSTEM SHALL** have its `CNAME`/DNS consistent with the canonical domain.

---

### US-04: Old links keep working

**As a** visitor following an old link,
**I want** legacy URLs (e.g. `#talk-<id>`) to land on the right new page,
**So that** shared/bookmarked links don't break.

#### Acceptance Criteria

- **WHEN** a legacy path is requested, **THE SYSTEM SHALL** redirect to the corresponding new route.
- **IF** the legacy URL is a hash route (`#talk-<id>`), **THEN THE SYSTEM SHALL** resolve it via a client-side shim to the new talk page.

---

### US-05: Secrets stay in platform env

**As a** maintainer,
**I want** Strapi URL/token only in Netlify env,
**So that** no secret is committed.

#### Acceptance Criteria

- **THE SYSTEM SHALL** read `STRAPI_API_URL` and `STRAPI_API_TOKEN` from Netlify environment variables.
- **THE SYSTEM SHALL NOT** require secrets in the repository.

---

### US-06: PRs get deploy previews

**As a** reviewer,
**I want** a preview deploy per PR,
**So that** I can review changes before merge.

#### Acceptance Criteria

- **WHEN** a PR is opened/updated, **THE SYSTEM SHALL** publish a deploy preview.

## Edge Cases & Error States

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| Strapi unreachable during build | Build fails; last good deploy stays live; failure visible in Netlify |
| Missing env var | Build fails fast with a clear message (not a silent empty site) |
| Hash legacy URL with unknown id | Client shim falls back to the talks archive, not a hard error |
| DNS/CNAME mismatch | Documented and reconciled; no split-brain between `bris.js.org` and `brisjs.org` |

## Out of Scope

- Building the Astro app (feature 002) and Strapi config (feature 003).
- Non-Netlify hosting (ADR-005 alternatives) unless revisited.
