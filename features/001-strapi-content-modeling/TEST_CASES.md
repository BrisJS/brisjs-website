# Test Cases: Strapi Content Modeling

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md` — this file covers explicit scenarios and test data.
> These cases validate the content model once the Strapi types are scaffolded.

## TC-01: Create a talk with speakers and event (Happy path)

**User story ref:** US-01
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | In Strapi admin, create two Speakers and one Event | Records saved |
| 2 | Create a Talk with title + date, link both speakers and the event | Talk saved with relations |
| 3 | Publish the talk | Talk has published state |
| 4 | `GET /api/talks?populate=speakers,event` | Talk returned with both speakers and the event populated |

**Test data:**
```
Speakers: "Ada Lovelace", "Grace Hopper"
Event: "BrisJS June 2026" @ 2026-06-25T18:00:00+10:00
Talk: "Async patterns", date 2026-06-25, youtubeUrl set
```

**Pass criteria:** API returns the talk with both speaker relations and the event.
**Fail criteria:** Relations missing/empty, or required-field validation fails to enforce title/date.

---

## TC-02: Draft talk is hidden from public API (Edge Case)

**User story ref:** US-06
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Create a Talk but do NOT publish | Talk in draft |
| 2 | `GET /api/talks` (public role) | Draft talk absent from the response |

**Pass criteria:** Draft is excluded from the public read API.
**Fail criteria:** Draft appears in the public response.

---

## TC-03: Required field validation (Error State)

**User story ref:** US-01
**Type:** Unit (Strapi schema validation)

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Attempt to save a Talk with no title | Validation error, save blocked |
| 2 | Attempt to save a Talk with an invalid URL in `youtubeUrl` | Validation error on the URL field |

**Pass criteria:** Schema rejects missing title and malformed URLs.
**Fail criteria:** Invalid entries persist.

---

## TC-04: Speaker reused across talks (Happy path)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Link one existing Speaker to a second Talk | Both talks reference the same speaker record |
| 2 | Edit that Speaker's bio | Updated bio reflected via both talks' populated responses |

**Pass criteria:** Single speaker record powers multiple talks; edits propagate.
**Fail criteria:** Speaker duplicated, or edit doesn't propagate.

---

## TC-05: Migration mapping coerces legacy talk (Integration)

**User story ref:** US-01
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Import a legacy TSV row (epoch-ms date, CSV speakers) per the DESIGN mapping | Talk created with a valid date and related Speaker records |
| 2 | Verify optional missing fields (no slides/code) | Fields empty, no error |

**Test data:**
```
TSV row: 42 \t 1466840400000 \t "Intro to X" \t "Ada Lovelace,Grace Hopper" \t "ada,grace" \t https://youtube.com/watch?v=abc \t \t \t "A synopsis"
```

**Pass criteria:** Coerced date is valid; two speakers linked; empty slides/code tolerated.
**Fail criteria:** Date invalid, speakers not split, or import errors on empty fields.

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| Sample speakers/events/talks | Minimal seed to exercise relations | inline above |
| Legacy TSV row | Represents a row from the current Google Sheet | inline (TC-05) |

## Coverage Checklist

- [ ] Happy path covered (create + relate + publish + read)
- [ ] Edge cases from `REQUIREMENTS.md` covered (draft hidden, optional fields)
- [ ] Error states from `REQUIREMENTS.md` covered (required-field / URL validation)
- [ ] Migration mapping coercion covered (legacy date + CSV speakers)
