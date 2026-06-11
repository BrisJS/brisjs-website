# Requirements: Astro Frontend

> EARS format — Easy Approach to Requirements Syntax
> Patterns: **Ubiquitous** | **Event-driven** | **Unwanted behaviour** | **State-driven** | **Optional**

## User Stories

### US-01: Visitor browses the talks archive

**As a** site visitor,
**I want to** see past talks grouped by event/month with titles, speakers, and thumbnails,
**So that** I can find and revisit talks I'm interested in.

#### Acceptance Criteria

- **WHEN** the archive page is requested, **THE SYSTEM SHALL** render published talks grouped by their event, newest first.
- **THE SYSTEM SHALL** link each talk to its detail page.
- **IF** a talk has a YouTube video, **THEN THE SYSTEM SHALL** show its poster-frame thumbnail.

---

### US-02: Visitor views a single talk

**As a** site visitor,
**I want to** open a talk's detail page with its speakers, video, slides, and code links,
**So that** I can watch/read the talk's materials.

#### Acceptance Criteria

- **THE SYSTEM SHALL** generate a static page per published talk.
- **WHEN** a talk has video/slides/code links, **THE SYSTEM SHALL** render the corresponding buttons.
- **IF** a link is absent, **THEN THE SYSTEM SHALL** omit that button without error.
- **IF** a talk has no linked speaker, **THEN THE SYSTEM SHALL** render a graceful placeholder.

---

### US-03: Visitor sees the next event on the home page

**As a** prospective attendee,
**I want to** see the upcoming meetup's details on the home page,
**So that** I know when/where to attend.

#### Acceptance Criteria

- **WHEN** an upcoming event exists, **THE SYSTEM SHALL** show its name, date/time, and venue on the home page.
- **IF** no upcoming event is available, **THEN THE SYSTEM SHALL** show a sensible fallback (e.g. "next event TBA").

---

### US-04: Visitor reads jobs and talk requests

**As a** community member,
**I want to** browse current job postings and requested talks,
**So that** I can respond or volunteer.

#### Acceptance Criteria

- **THE SYSTEM SHALL** render published job postings and talk requests with their rich-text body.

---

### US-05: Visitor reads static pages

**As a** visitor,
**I want to** read the Code of Conduct and Find Us / venue information,
**So that** I understand the rules and how to get there.

#### Acceptance Criteria

- **THE SYSTEM SHALL** render the Code of Conduct and Find Us single types as pages.

---

### US-06: Search engines and link previews work

**As a** search engine / social platform,
**I want to** read fully-rendered HTML and metadata,
**So that** pages are indexable and produce rich link previews.

#### Acceptance Criteria

- **THE SYSTEM SHALL** output fully-rendered static HTML per page (no JS required for content).
- **THE SYSTEM SHALL** include per-page title, description, and Open Graph/Twitter metadata.

## Edge Cases & Error States

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| Strapi unreachable at build time | Build fails loudly with a clear error (don't ship a half-empty site) |
| Talk with malformed/empty YouTube URL | Render without a video embed; no broken iframe |
| Empty archive (no published talks) | Render an empty-state message, not a broken grid |
| Legacy `#talk-<id>` URL visited | Redirect to the new talk route (implemented in feature 004) |

## Out of Scope

- Client-side search/filtering of talks (could be a later island/feature).
- User accounts, comments, or submissions from the website.
- Live (runtime) data fetching from Strapi in the browser.
