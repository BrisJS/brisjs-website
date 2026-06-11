# Requirements: Strapi Content Modeling

> EARS format — Easy Approach to Requirements Syntax
> Patterns: **Ubiquitous** | **Event-driven** | **Unwanted behaviour** | **State-driven** | **Optional**

## User Stories

### US-01: Organizer manages talks

**As a** BrisJS organizer,
**I want to** create and edit talks (title, date, synopsis, video/slides/code links, speakers, event) in one CMS,
**So that** I no longer maintain a separate Google Sheet and the archive stays consistent.

#### Acceptance Criteria

- **WHEN** an organizer creates a talk, **THE SYSTEM SHALL** require a title and date and allow linking one or more speakers and one event.
- **IF** a YouTube/slides/code URL is provided, **THEN THE SYSTEM SHALL** store and validate it as a URL.
- **WHILE** a talk is in draft, **THE SYSTEM SHALL** keep it out of the published API response.

---

### US-02: Organizer manages speakers and reuses them

**As a** BrisJS organizer,
**I want to** maintain speaker records (name, bio, photo, links) once and reference them from many talks,
**So that** speaker information is consistent and not duplicated per talk.

#### Acceptance Criteria

- **THE SYSTEM SHALL** allow a speaker to be related to many talks, and a talk to many speakers.
- **WHEN** a speaker's bio or photo is updated, **THE SYSTEM SHALL** reflect it everywhere that speaker is referenced.

---

### US-03: Organizer manages events

**As a** BrisJS organizer,
**I want to** record each meetup event (name, date/time, venue, description) and link its talks,
**So that** the site can show event line-ups without depending on the live Meetup API.

#### Acceptance Criteria

- **WHEN** an event is created, **THE SYSTEM SHALL** allow associating multiple talks with it.

---

### US-04: Organizer curates jobs and talk requests

**As a** BrisJS organizer,
**I want to** publish job postings and talk requests with a status,
**So that** these replace the GitHub-issue workflow with a moderated CMS list.

#### Acceptance Criteria

- **THE SYSTEM SHALL** allow each job posting and talk request to carry a status (e.g. open/closed/filled).
- **WHILE** an entry is unpublished or closed, **THE SYSTEM SHALL** exclude it from the public list as configured.

---

### US-05: Organizer edits static pages

**As a** BrisJS organizer,
**I want to** edit the Code of Conduct and Find Us / Venue content in the CMS,
**So that** changes don't require a code edit and deploy.

#### Acceptance Criteria

- **THE SYSTEM SHALL** expose Code of Conduct and Find Us as single types with rich-text content.

---

### US-06: Visitor reads published content

**As a** site visitor,
**I want to** see only published, current content,
**So that** I never see drafts or stale entries.

#### Acceptance Criteria

- **THE SYSTEM SHALL** serve only published entries on the public read API.
- **THE SYSTEM SHALL NOT** expose any CMS credentials or admin-only fields to the public.

## Edge Cases & Error States

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| Talk with no speaker linked | Allowed but flagged; renders with a generic "Speaker TBA" placeholder downstream |
| Talk with no video/slides/code | Fields optional; downstream UI hides the missing links (as today) |
| Speaker referenced by many talks then deleted | Deletion blocked or relations nulled gracefully — no broken talk records |
| Historical talk missing a clean date | Migration must coerce the epoch-ms value from the sheet into a valid date |

## Out of Scope

- Public/contributor submission of jobs or talk requests via the website (organizer-entered for now).
- Speaker self-service editing/login.
- Automated sync from the legacy Google Sheet / Meetup / GitHub after migration.
