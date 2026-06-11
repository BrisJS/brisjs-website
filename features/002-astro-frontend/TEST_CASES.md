# Test Cases: Astro Frontend

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md`.

## TC-01: Talks archive renders grouped by event (Happy path)

**User story ref:** US-01
**Type:** Integration (build + rendered HTML)

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Seed Strapi with 2 events, 3 published talks across them | Data available |
| 2 | Run the Astro build | `/talks` generated |
| 3 | Inspect `/talks` HTML | Talks grouped under their event, newest first, each linking to its detail page |

**Pass criteria:** Correct grouping/order; links resolve to generated detail pages.
**Fail criteria:** Ungrouped, wrong order, or dead links.

---

## TC-02: Talk detail page generated per talk (Happy path)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Build with a talk that has speakers + video + slides + code | `/talks/<slug>` generated |
| 2 | Inspect the page | Speaker card(s), video embed, and Slides/Video/Code buttons present |

**Pass criteria:** A static page exists for the talk with all populated resources.
**Fail criteria:** Missing page, missing relations, or broken embed.

---

## TC-03: Missing optional fields render gracefully (Edge Case)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Build a talk with no video, no slides, no code, no speaker | Page builds |
| 2 | Inspect the page | No resource buttons, no broken iframe, speaker placeholder shown |

**Pass criteria:** Clean render, no errors, no empty broken elements.
**Fail criteria:** Broken iframe/buttons or build error.

---

## TC-04: Data-layer grouping logic (Unit)

**User story ref:** US-01
**Type:** Unit

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Call `groupByEvent(talks)` in `src/data/talks.ts` with fixture talks | Talks grouped by event with correct ordering |

**Test data:**
```
3 talk view models across 2 events with known dates
```

**Pass criteria:** Grouping matches the legacy `getTalksByMeetup` semantics.
**Fail criteria:** Wrong grouping/order.

---

## TC-05: No Strapi token in shipped output (Error/Security)

**User story ref:** US-06
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Build the site with a Strapi token set | Build succeeds |
| 2 | Grep the `dist/` output for the token value and the raw API base | Neither present in shipped assets |

**Pass criteria:** No token/secret leaks into client output.
**Fail criteria:** Token or admin endpoint found in `dist/`.

---

## TC-06: Build fails loudly when Strapi is unreachable (Error State)

**User story ref:** US-01 (edge)
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Point the data layer at an unreachable Strapi URL and build | Build exits non-zero with a clear error |

**Pass criteria:** Build fails with an actionable message (no half-empty deploy).
**Fail criteria:** Build "succeeds" with missing content.

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| Seed talks/events/speakers | Minimal fixtures to exercise pages | local Strapi or mocked fetch |
| Talk view-model fixtures | For data-layer unit tests | inline / `__fixtures__` |

## Coverage Checklist

- [ ] Happy path covered (archive + detail render from Strapi)
- [ ] Edge cases from `REQUIREMENTS.md` covered (missing fields, empty archive)
- [ ] Error states covered (Strapi unreachable, no token leak)
- [ ] SEO/metadata presence checked on key pages
