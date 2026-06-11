# Requirements: Strapi Backend Integration

> EARS format — Easy Approach to Requirements Syntax
> Patterns: **Ubiquitous** | **Event-driven** | **Unwanted behaviour** | **State-driven** | **Optional**

## User Stories

### US-01: Organizer publishes content that goes live

**As a** BrisJS organizer,
**I want to** publish or update content in Strapi and have the site update automatically,
**So that** I don't need to touch code or trigger deploys manually.

#### Acceptance Criteria

- **WHEN** an organizer publishes/updates/deletes a public content entry, **THE SYSTEM SHALL** call the Netlify build hook to trigger a rebuild.
- **WHILE** an entry is in draft, **THE SYSTEM SHALL NOT** include it in the public API response.

---

### US-02: Public API is read-only and published-only

**As a** site (build) consumer,
**I want to** read only published content via a scoped token,
**So that** no private/draft data or write access is exposed.

#### Acceptance Criteria

- **THE SYSTEM SHALL** grant the Public role `find`/`findOne` on public types and deny create/update/delete.
- **THE SYSTEM SHALL** serve only published entries on the public API.
- **THE SYSTEM SHALL** authenticate build-time reads with a read-only API token.

---

### US-03: Secrets stay out of the repo and client

**As a** maintainer,
**I want** API tokens and the Strapi URL kept in platform env, not in code,
**So that** secrets never leak.

#### Acceptance Criteria

- **THE SYSTEM SHALL** store the build token and API base URL as Netlify environment variables.
- **THE SYSTEM SHALL NOT** require any secret to be committed to the repo.

---

### US-04: Legacy content is migrated

**As a** BrisJS organizer,
**I want** the historical talks/speakers/events and current jobs/requests/static pages imported into Strapi,
**So that** the new site has the existing content from day one.

#### Acceptance Criteria

- **WHEN** the migration runs, **THE SYSTEM SHALL** create Strapi entries per the feature-001 mapping (coercing legacy dates, splitting CSV speakers, deduplicating speakers by name).
- **THE SYSTEM SHALL** be idempotent/re-runnable without creating duplicates.

## Edge Cases & Error States

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| Webhook call to Netlify fails | Strapi logs the failure; a manual rebuild remains possible; content still saved |
| Free-plan limit reached during migration | Migration stops with a clear report; record in SPEC Open Question 1 |
| Build token leaked/rotated | Token can be revoked/rotated in Strapi and updated in Netlify env without code change |
| CORS misconfigured | Build/preview fetches fail with a clear CORS error; documented allowed origins |

## Out of Scope

- Designing the content schema (feature 001).
- Frontend rendering (feature 002) and Netlify config specifics (feature 004).
- Self-hosting / DB administration (ADR-002 future option).
- Public content submission workflows.
